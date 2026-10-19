import {applicationDefault,initializeApp} from 'firebase-admin/app'
import {getAuth} from 'firebase-admin/auth'
import {getFirestore,FieldValue} from 'firebase-admin/firestore'
import {getMessaging} from 'firebase-admin/messaging'
const args=process.argv.slice(2),command=args.shift(),option=k=>args[args.indexOf(k)+1]
if(!['provision','push'].includes(command))throw Error('Usage: node scripts/admin.mjs provision --uid UID --role owner|developer, or push --audience customer|staff|management|owner|all --body TEXT')
if(process.env.FIRESTORE_EMULATOR_HOST||process.env.FIREBASE_AUTH_EMULATOR_HOST)throw Error('This tool is for the final project only; use test fixtures for emulators.')
initializeApp({credential:applicationDefault(),projectId:'loki-portal-final'})
const db=getFirestore(),auth=getAuth()
if(command==='provision'){
 const uid=option('--uid'),role=option('--role');if(!uid||!['owner','developer'].includes(role))throw Error('Supply an existing account UID and owner or developer role.')
 const u=await auth.getUser(uid);if(!u.email)throw Error('Account needs an email.')
 const name=u.displayName||role
 await auth.setCustomUserClaims(uid,{...u.customClaims,lokiRole:role})
 await db.doc(`publicProfiles/${uid}`).set({name,email:u.email,role,qrCode:uid,approved:true,disabled:false,createdAt:FieldValue.serverTimestamp()},{merge:true})
 // Only administrators use this; privileged identities never go into customer records.
 console.log('Provisioned existing account in loki-portal-final. Sign in again to refresh claims.')
}else{
 const audience=option('--audience'),body=option('--body');if(!body||!['customer','staff','management','owner','all'].includes(audience))throw Error('Supply audience and message body.')
 const snap=await db.collection('pushTokens').get();let sent=0,failed=0
 for(const d of snap.docs){const t=d.data();const profile=await db.doc(`publicProfiles/${t.userId}`).get();const p=profile.data();if(!p?.approved||p.disabled||(audience!=='all'&&p.role!==audience))continue
  try{await getMessaging().send({token:t.token,notification:{title:'Loki',body},android:{notification:{channelId:'loki_notices'}}});sent++}catch(e){failed++;if(['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(e.code))await d.ref.delete()}
 }
 console.log({sent,failed})
}
