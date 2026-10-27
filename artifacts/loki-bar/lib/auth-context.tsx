'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { UserDoc } from './firebase-types'

interface State {
  user: User | null
  profile: UserDoc | null
  loading: boolean
  error: string | null
}

const initialState: State = { user: null, profile: null, loading: true, error: null }
const Context = createContext<State>(initialState)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState)

  useEffect(() => {
    let stopProfile: (() => void) | undefined

    const stopAuth = onAuthStateChanged(
      auth,
      (user) => {
        stopProfile?.()
        stopProfile = undefined
        setState({ user, profile: null, loading: Boolean(user), error: null })
        if (!user) return

        stopProfile = onSnapshot(
          doc(db, 'publicProfiles', user.uid),
          (snapshot) => setState({
            user,
            profile: snapshot.exists() ? snapshot.data() as UserDoc : null,
            loading: false,
            error: snapshot.exists() ? null : 'Your account profile is missing. Contact Loki support.',
          }),
          () => setState({
            user,
            profile: null,
            loading: false,
            error: 'Unable to load your account. Check your connection and Firebase configuration.',
          }),
        )
      },
      () => {
        stopProfile?.()
        stopProfile = undefined
        setState({
          user: null,
          profile: null,
          loading: false,
          error: 'Unable to verify your sign-in. Check your connection and try again.',
        })
      },
    )

    return () => {
      stopAuth()
      stopProfile?.()
    }
  }, [])

  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const useAuthContext = () => useContext(Context)
