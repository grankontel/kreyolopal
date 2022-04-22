import React from 'react'
import LoginForm from '../components/LoginForm'
import StandardPage from '../layouts/StandardPage'
import { useAuth } from '../components/AuthProvider'

const SignupPage = () => {
  const auth = useAuth()
  const onSubmit = async ({ email, password, setLoading }) => {
    try {
      setLoading(true)
      const { error } = auth.signUp({ email, password })

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
      <LoginForm buttonLabel="Sign Up" onSubmit={onSubmit} />
    </StandardPage>
  )
}

export default SignupPage
