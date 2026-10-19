'use client'
import {useEffect,useState} from 'react'
import {signup} from '@/lib/firebase-service'
import {LokiMark} from './loki-wordmark'
import {TaskForm} from './portal-ui'
export function Signup({invited=false}:{invited?:boolean}){
 const [token,setToken]=useState(''),[done,setDone]=useState(false)
 useEffect(()=>{setToken(new URLSearchParams(location.search).get('invite')??'')},[])
 return <main className="auth-screen"><LokiMark className="h-24 w-24"/><h1>{invited?'Your Loki invitation':'Welcome to Loki'}</h1>{done?<div role="status"><p>{invited?'Your account was created. Please wait for approval.':'Your account is ready.'}</p><a href="/login/">Sign in</a></div>:invited&&!token?<p role="alert">An invitation link is required. Ask Loki for a fresh link.</p>:<TaskForm label="Create account" fields={[{name:'name',label:'Your name',maxLength:80},{name:'email',label:'Email',type:'email'},{name:'password',label:'Password (at least 8 characters)',type:'password'}]} onSubmit={async v=>{if(v.password.length<8)throw Error('Use at least 8 characters for your password.');await signup(v.name,v.email,v.password,invited?token:'');setDone(true)}}/>}<a href="/login/">Back to sign in</a><small>Developed by ARZO · Roza Sanyal</small></main>
}
