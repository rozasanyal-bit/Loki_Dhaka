'use client'
import {useCallback,useEffect,useState} from 'react'
import {signOut} from 'firebase/auth'
import {QRCodeSVG} from 'qrcode.react'
import {auth} from '@/lib/firebase'
import {useAuthContext} from '@/lib/auth-context'
import * as api from '@/lib/firebase-service'
import {LokiMark} from './loki-wordmark'
import {Card,TaskForm,Action} from './portal-ui'
export function CustomerPortalConnected(){
 const {user,profile}=useAuthContext(),[qr,setQr]=useState<{value:string;expiresAt:number}|null>(null),[seconds,setSeconds]=useState(0),[error,setError]=useState(''),[visits,setVisits]=useState<api.Row[]>([]),[notices,setNotices]=useState<api.Row[]>([]),[issues,setIssues]=useState<api.Row[]>([]),[tab,setTab]=useState('My QR')
 const refreshQr=useCallback(async()=>{setError('');try{setQr(await api.issueQr())}catch(e){setQr(null);setError(e instanceof Error?e.message:'Unable to create QR.')}},[])
 const load=useCallback(async()=>{if(!user)return;try{const [v,i]=await Promise.all([api.rows('visits',api.where('userId','==',user.uid)),api.rows('issues',api.where('authorId','==',user.uid))]);setVisits(v);setIssues(i)}catch{setError('Could not load your records. Check your connection.')}},[user])
 useEffect(()=>{void load();void refreshQr()},[load,refreshQr])
 useEffect(()=>{const timer=setInterval(()=>setSeconds(qr?Math.max(0,Math.ceil((qr.expiresAt-Date.now())/1000)):0),1000);return()=>clearInterval(timer)},[qr])
 useEffect(()=>api.watchNotices('customer',setNotices,e=>setError(e.message)),[])
 return <main className="portal customer"><header className="portal-header"><div className="brand"><LokiMark className="h-16 w-16"/><div><p className="eyebrow">Your evening at Loki</p><h1>Welcome, {profile?.name}</h1></div></div><Action run={()=>signOut(auth)}>Sign out</Action></header><nav aria-label="Customer sections">{['My QR','Visits','Notices','Feedback','Profile'].map(t=><button aria-current={tab===t?'page':undefined} key={t} onClick={()=>setTab(t)}>{t}</button>)}</nav>{error&&<p role="alert" className="error">{error}</p>}
 {tab==='My QR'&&<Card title="Your guest pass"><p>Show this QR to Loki staff. It expires in 90 seconds and can be used once.</p>{qr&&seconds>0?<div className="qr"><QRCodeSVG value={qr.value} size={220}/><p>{seconds}s remaining</p></div>:<p>Your pass has expired. Refresh it when staff are ready to scan.</p>}<Action run={refreshQr}>Refresh QR</Action><div className="links"><a href="/menu/loki-menu.pdf" target="_blank" rel="noreferrer">Browse the menu</a><a href="/install/">Install Loki</a></div><p className="muted">Your spending, internal classification and staff notes stay private.</p></Card>}
 {tab==='Visits'&&<Card title="Your visits"><Action run={load}>Refresh visits</Action>{visits.map(v=><p className="list-item" key={v.id}>{api.formatDate(v.timestamp)}</p>)}{!visits.length&&<p>Your first visit will appear after staff check you in.</p>}</Card>}
 {tab==='Notices'&&<Card title="What’s happening at Loki">{notices.map(n=><article className="list-item" key={n.id}><p>{n.body}</p><small>{api.formatDate(n.createdAt)}</small></article>)}{!notices.length&&<p>No announcements right now.</p>}</Card>}
 {tab==='Feedback'&&<><Card title="We’re listening"><p>Complaints and feedback go privately to Loki HR/management. Your submitted reports and their responses appear below.</p><TaskForm label="Send to Loki management" fields={[{name:'kind',label:'Report type',options:['feedback','complaint']},{name:'body',label:'Your message',type:'textarea'}]} onSubmit={async v=>{await api.submitIssue(v.kind,v.body);await load()}}/></Card><Card title="Your reports"><Action run={load}>Refresh responses</Action>{issues.map(i=><article className="list-item" key={i.id}><span className="badge">{i.status}</span><p>{i.body}</p>{i.response&&<p>Loki management: {i.response}</p>}</article>)}{!issues.length&&<p>No reports submitted.</p>}</Card></>}
 {tab==='Profile'&&<Card title="Your profile"><p>{user?.email}</p><TaskForm label="Save profile" fields={[{name:'name',label:'Your name',maxLength:80,value:profile?.name}]} onSubmit={v=>api.updateProfile(v.name)}/><p>Contact Loki staff for help with your account.</p></Card>}
 <footer>Developed by ARZO · Roza Sanyal</footer></main>
}
