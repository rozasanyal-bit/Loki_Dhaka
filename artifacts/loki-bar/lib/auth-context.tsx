'use client'
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react'
import {onAuthStateChanged,type User} from 'firebase/auth'
import {doc,onSnapshot} from 'firebase/firestore'
import {auth,db} from './firebase'
import type {UserDoc} from './firebase-types'
interface State {user:User|null;profile:UserDoc|null;loading:boolean;error:string|null}
const Context=createContext<State>({user:null,profile:null,loading:true,error:null})
export function AuthProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<State>({user:null,profile:null,loading:true,error:null})
 useEffect(()=>{let stopProfile:undefined|(()=>void);const stop=onAuthStateChanged(auth,user=>{
  stopProfile?.();setState({user,profile:null,loading:!!user,error:null});if(!user)return
  stopProfile=onSnapshot(doc(db,'publicProfiles',user.uid),snap=>setState({user,profile:snap.exists()?snap.data() as UserDoc:null,loading:false,error:snap.exists()?null:'Your account profile is missing. Contact Loki support.'}),()=>setState({user,profile:null,loading:false,error:'Unable to load your account. Check your connection and Firebase configuration.'}))
 });return()=>{stop();stopProfile?.()}},[])
 return <Context.Provider value={state}>{children}</Context.Provider>
}
export const useAuthContext=()=>useContext(Context)
