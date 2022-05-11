import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = React.createContext(null)

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)

  useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const signIn = ({ email, password }) => {
    return supabase.auth
      .signIn({
        email: email,
        password: password,
      })
      .then(
        (resp) => {
          setSession(resp.session)
          return resp
        },
        (reason) => {
          return reason
        }
      )
      .catch((err) => {
        return err
      })
  }

  const signUp = ({ email, password }) => {
    return supabase.auth
      .signUp({
        email: email,
        password: password,
      })
      .then(
        (resp) => {
          setSession(resp.session)
          return resp
        },
        (reason) => {
          return reason
        }
      )
      .catch((err) => {
        return err
      })
  }

  const signOut = () => {
    return supabase.auth
      .signOut()
      .then(
        (resp) => {
          return resp
        },
        (reason) => {
          return reason
        }
      )
      .catch((err) => {
        return err
      })
  }
  const value = { user: session?.user, session, signIn, signUp, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return React.useContext(AuthContext)
}

export default AuthProvider
