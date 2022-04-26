import React from 'react'
import LoginForm from '../components/LoginForm'
import StandardPage from '../layouts/StandardPage'
import { useAuth } from '../components/AuthProvider'
import { Box, Heading } from 'react-bulma-components'

const LoginPage = () => {
  const auth = useAuth()

  const onSubmit = async ({ email, password, setLoading }) => {
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
      <Box className="login_form">
        <Heading size={2} renderAs='h1'>Log in</Heading>
        <LoginForm buttonLabel="Login" onSubmit={onSubmit} />
      </Box>
    </StandardPage>
  )
}

export default LoginPage
