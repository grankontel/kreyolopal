import React from 'react'
import LoginForm from '../components/LoginForm'
import StandardPage from '../layouts/StandardPage'
import { useAuth } from '../components/AuthProvider'

const LoginPage = () => {
    const auth = useAuth()

    const onSubmit = async ({email, password, setLoading}) =>  {
        try {
            setLoading(true)
            const { error } = await auth.signIn({
              email: email,
              password: password,
            })
      
            if (error) throw error
            alert('Check your email for the login link!')
          } catch (error) {
            alert(error.error_description || error.message)
          } finally {
            setLoading(false)
          }
      
    }
  return (
    <StandardPage>
        <LoginForm buttonLabel='Login' onSubmit={onSubmit} />
    </StandardPage>
  )
}   

export default LoginPage
