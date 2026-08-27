"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { UserDoc, PublicUserDoc } from "@/lib/firebase-types"
import { isRole } from "@/lib/roles"
interface AuthContextValue { user: User | null; profile: UserDoc | null; loading: boolean }
const AuthContext = createContext<AuthContextValue>({ user:null, profile:null, loading:true })
function publicToProfile(data: PublicUserDoc): UserDoc { return { name:data.name,email:data.email,createdAt:data.createdAt,favoriteDrink:"",notes:[],role:data.role,qrCode:data.qrCode } }
export function AuthProvider({children}:{children:ReactNode}) {
  const [state,setState]=useState<AuthContextValue>({user:null,profile:null,loading:true})
  useEffect(()=>onAuthStateChanged(auth,async firebaseUser=>{
    if(!firebaseUser){setState({user:null,profile:null,loading:false});return}
    try{
      const pub=await getDoc(doc(db,"publicProfiles",firebaseUser.uid))
      if(!pub.exists()){setState({user:firebaseUser,profile:null,loading:false});return}
      const publicProfile=pub.data() as PublicUserDoc
      if(!isRole(publicProfile.role)){setState({user:firebaseUser,profile:null,loading:false});return}
      if(publicProfile.role==="customer"){setState({user:firebaseUser,profile:publicToProfile(publicProfile),loading:false});return}
      const priv=await getDoc(doc(db,"users",firebaseUser.uid))
      setState({user:firebaseUser,profile:priv.exists()?(priv.data() as UserDoc):publicToProfile(publicProfile),loading:false})
    }catch{setState({user:firebaseUser,profile:null,loading:false})}
  }),[])
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
export function useAuthContext(){return useContext(AuthContext)}
