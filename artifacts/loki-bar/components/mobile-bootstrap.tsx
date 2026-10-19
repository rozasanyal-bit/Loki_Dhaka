'use client'
import {useEffect,useState} from 'react'
import {Capacitor} from '@capacitor/core'
import {useAuthContext} from '@/lib/auth-context'
import {savePushToken} from '@/lib/firebase-service'
export function MobileBootstrap(){
 const {user,profile}=useAuthContext(),[status,setStatus]=useState('')
 useEffect(()=>{if(!Capacitor.isNativePlatform())return;void import('@capacitor/splash-screen').then(m=>m.SplashScreen.hide()).catch(()=>{})},[])
 async function enable(){
  try{
   const {PushNotifications}=await import('@capacitor/push-notifications')
   const permission=await PushNotifications.requestPermissions()
   if(permission.receive!=='granted'){setStatus('Notifications are off. You can still read notices in Loki.');return}
   await PushNotifications.addListener('registration',t=>{void savePushToken(t.value,Capacitor.getPlatform()).then(()=>setStatus('Notifications enabled.')).catch(()=>setStatus('Could not save notification settings. Try again.'))})
   await PushNotifications.addListener('registrationError',()=>setStatus('Push service unavailable. Notices remain available in Loki.'))
   await PushNotifications.addListener('pushNotificationReceived',n=>setStatus(n.title??'New Loki notification'))
   await PushNotifications.register()
  }catch{setStatus('Push notifications are not configured on this device. Notices are available inside Loki.')}
 }
 if(!Capacitor.isNativePlatform()||!user||!profile?.approved||profile.disabled)return null
 return <aside className="portal"><button className="portal-card" onClick={()=>void enable()}>Enable optional notifications</button>{status&&<p role="status">{status}</p>}</aside>
}
