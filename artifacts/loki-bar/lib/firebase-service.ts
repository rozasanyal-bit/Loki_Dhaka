import { collection,doc,getDoc,getDocs,setDoc,updateDoc,addDoc,query,where,limit,serverTimestamp,Timestamp,runTransaction,writeBatch,onSnapshot,type QueryConstraint,type DocumentData } from 'firebase/firestore'
import { createUserWithEmailAndPassword,deleteUser } from 'firebase/auth'
import { auth,db } from './firebase'
import type { Role } from './roles'
export type Row = DocumentData & {id:string}
export const dateISO=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
export function formatDate(value: Timestamp|null|undefined){return value?.toDate().toLocaleString('en-GB',{timeZone:'Asia/Dhaka'})??'—'}
export function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('')}
export async function rows(name:string,...conditions:QueryConstraint[]):Promise<Row[]>{
 const snap=await getDocs(query(collection(db,name),...conditions,limit(1000)))
 return (snap.docs.map(d=>({...d.data(),id:d.id})) as Row[]).sort((a,b)=>(b.createdAt?.seconds??b.timestamp?.seconds??0)-(a.createdAt?.seconds??a.timestamp?.seconds??0))
}
export function watchNotices(role:Role,callback:(r:Row[])=>void,onError:(e:Error)=>void){
 return onSnapshot(query(collection(db,'notices'),where('audience','in',role==='owner'||role==='management'?['all','customer','staff','management']:['all',role]),limit(50)),s=>callback((s.docs.map(d=>({...d.data(),id:d.id})) as Row[]).sort((a,b)=>(b.createdAt?.seconds??0)-(a.createdAt?.seconds??0))),onError)
}
export async function signup(name:string,email:string,password:string,invite=''){
 const cleanName=name.trim(),cleanEmail=email.trim()
 if(!cleanName||cleanName.length>80)throw Error('Enter a name of up to 80 characters.')
 if(password.length<8)throw Error('Use at least 8 characters for your password.')
 if(invite){
  if(!/^[a-f0-9]{48}$/.test(invite))throw Error('This invitation link is invalid. Ask Loki for a fresh link.')
  let invitation
  try{invitation=await getDoc(doc(db,'staffInvites',invite))}
  catch(error){
   if(error instanceof Error && 'code' in error && error.code==='permission-denied')throw Error('This invitation has expired or was already used.')
   throw error
  }
  if(!invitation.exists()||!invitation.data().active||invitation.data().expiresAt?.toMillis()<=Date.now())throw Error('This invitation has expired or was already used.')
 }
 const cred=await createUserWithEmailAndPassword(auth,cleanEmail,password)
 try{
  const uid=cred.user.uid
  await runTransaction(db,async tx=>{
   let role:Role='customer'
   if(invite){const s=await tx.get(doc(db,'staffInvites',invite));if(!s.exists()||!s.data().active||s.data().expiresAt.toMillis()<=Date.now())throw Error('This invitation has expired or was already used.');role=s.data().role;tx.update(s.ref,{active:false,usedBy:uid})}
   const common={name:cleanName,email:cred.user.email,role,qrCode:uid,createdAt:serverTimestamp()}
   tx.set(doc(db,'publicProfiles',uid),{...common,approved:role==='customer',disabled:false,...(invite?{inviteToken:invite}:{})})
   tx.set(doc(db,'users',uid),{...common,favoriteDrink:'',notes:[],status:'Standard',approved:false})
  })
 }catch(e){await deleteUser(cred.user).catch(()=>{});throw e}
}
export async function createInvite(role:'staff'|'management'|'owner'){
 if(!auth.currentUser)throw Error('Sign in first.')
 const token=randomToken()
 await setDoc(doc(db,'staffInvites',token),{role,createdBy:auth.currentUser.uid,createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+24*3600000),active:true,usedBy:''})
 return token
}
export const revokeInvite=(id:string)=>updateDoc(doc(db,'staffInvites',id),{active:false})
export const approveMember=(id:string,approved:boolean,disabled=false)=>updateDoc(doc(db,'publicProfiles',id),{approved,disabled})
export async function venue(){const s=await getDoc(doc(db,'settings','venue'));return s.exists()?s.data():{qrEpoch:0,maintenance:false}}
export async function setVenue(change:{rotate?:boolean;maintenance?:boolean}){
 await runTransaction(db,async tx=>{const ref=doc(db,'settings','venue');const s=await tx.get(ref);const v=s.exists()?s.data():{qrEpoch:0,maintenance:false};tx.set(ref,{qrEpoch:v.qrEpoch+(change.rotate?1:0),maintenance:change.maintenance??v.maintenance})})
}
export async function issueQr(){
 if(!auth.currentUser)throw Error('Sign in first.')
 const v=await venue();if(v.maintenance)throw Error('Loki is being updated. Please ask staff for help.')
 const token=randomToken();const expiresAt=Timestamp.fromMillis(Date.now()+90000)
 await setDoc(doc(db,'qrTokens',token),{userId:auth.currentUser.uid,createdAt:serverTimestamp(),expiresAt,epoch:v.qrEpoch,usedBy:''})
 return {value:`loki:checkin:${token}`,expiresAt:expiresAt.toMillis()}
}
export async function scanGuest(input:string){
 const match=/^loki:checkin:([a-f0-9]{48})$/.exec(input.trim());if(!match)throw Error('Scan a current Loki QR. A customer UID is not a valid check-in token.')
 const token=match[1];const s=await getDoc(doc(db,'qrTokens',token));if(!s.exists())throw Error('QR not found.')
 const t=s.data();if(t.usedBy||t.expiresAt.toMillis()<Date.now())throw Error('QR already used or expired. Ask the guest to refresh it.')
 const guest=await getDoc(doc(db,'users',t.userId));if(!guest.exists()||guest.data().role!=='customer')throw Error('Customer not found.')
 return {token,guest:{...guest.data(),id:guest.id} as Row}
}
export async function checkIn(token:string){
 const staffId=auth.currentUser?.uid;if(!staffId)throw Error('Sign in first.')
 return runTransaction(db,async tx=>{const ref=doc(db,'qrTokens',token);const s=await tx.get(ref);if(!s.exists()||s.data().usedBy||s.data().expiresAt.toMillis()<Date.now())throw Error('QR already used or expired.')
 const settings=await tx.get(doc(db,'settings','venue'))
 if(settings.exists() && settings.data().maintenance===true)throw Error('Check-ins are paused for maintenance.')
 if(s.data().epoch!==(settings.exists()?settings.data().qrEpoch:0))throw Error('This QR was invalidated. Ask the guest to refresh it.')
 tx.set(doc(db,'visits',token),{userId:s.data().userId,staffId,date:dateISO(),timestamp:serverTimestamp()});tx.update(ref,{usedBy:staffId})})
}
export async function changeCustomer(customerId:string,change:{status?:string;seat?:string;note?:string},reason:string){
 if(!reason.trim())throw Error('Enter a reason for this change.')
 const actorId=auth.currentUser?.uid;if(!actorId)throw Error('Sign in first.')
 await runTransaction(db,async tx=>{const ref=doc(db,'users',customerId);const s=await tx.get(ref);if(!s.exists())throw Error('Customer not found.')
 const auditRef=doc(collection(db,'audit'));const {note,...fields}=change
 tx.update(ref,{...fields,...(note?{notes:[...(s.data().notes??[]),note.trim()].slice(-100)}:{}),auditId:auditRef.id})
 tx.set(auditRef,{actorId,customerId,action:change.status?'status':change.seat!==undefined?'seating':'note',reason:reason.trim(),timestamp:serverTimestamp()})})
}
export async function submitIssue(kind:string,body:string){if(!auth.currentUser)throw Error('Sign in first.');await addDoc(collection(db,'issues'),{kind,body:body.trim(),authorId:auth.currentUser.uid,status:'new',response:'',createdAt:serverTimestamp()})}
export const resolveIssue=(id:string,status:string,response:string)=>updateDoc(doc(db,'issues',id),{status,response})
export const publishNotice=(body:string,audience:string)=>addDoc(collection(db,'notices'),{body:body.trim(),audience,createdAt:serverTimestamp()})
export const startShift=(name:string)=>addDoc(collection(db,'attendance'),{userId:auth.currentUser!.uid,name,startedAt:serverTimestamp(),endedAt:null})
export const endShift=(id:string)=>updateDoc(doc(db,'attendance',id),{endedAt:serverTimestamp()})
export async function updateProfile(name:string){const batch=writeBatch(db);batch.update(doc(db,'publicProfiles',auth.currentUser!.uid),{name:name.trim()});batch.update(doc(db,'users',auth.currentUser!.uid),{name:name.trim()});await batch.commit()}
export async function databaseHealth(){const started=performance.now();await getDoc(doc(db,'publicProfiles',auth.currentUser!.uid));return Math.round(performance.now()-started)}
export async function savePushToken(token:string,platform:string){if(!auth.currentUser)return;const id=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));const key=Array.from(new Uint8Array(id),b=>b.toString(16).padStart(2,'0')).join('');await setDoc(doc(db,'pushTokens',key),{userId:auth.currentUser.uid,token,platform,updatedAt:serverTimestamp()})}
export {where,doc,db,getDoc,writeBatch}

export const recordActivity=(name:string,body:string)=>addDoc(collection(db,'activity'),{userId:auth.currentUser!.uid,name,body:body.trim(),createdAt:serverTimestamp()})
