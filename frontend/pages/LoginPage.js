import React, { useState, useEffect } from 'react'
import LoginForm from '../components/LoginForm'
import StandardPage from '../layouts/StandardPage'
import { Box, Button, Heading, Notification } from 'react-bulma-components'
import { useZakari } from '../components/ZakProvider'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const [message, setMessage] = useState('')
  const auth = useZakari()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth !== null && auth.user !== null) {
      navigate('/')
    }
  })

  const onSubmit = async ({ email, password, setLoading }) => {
    console.log({ email, password, setLoading })
    try {
      setLoading(true)
      setMessage('')
      auth.signIn(email, password).then(
        () => {
          navigate('/')
        },
        (reason) => {
          const code = reason?.code || 500
          const msg =
            code === 500
              ? 'Erreur inconnue, veuillez essayer ultérieurement'
              : 'Identifiant inconnu ou mot de passe incorrect'
          setMessage(msg)
        }
      )
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <StandardPage>
      <Box className="login_form">
        <Heading size={2} renderAs="h1">
          Log in
        </Heading>
        {message.length > 0 ? (
          <Notification color="danger">
            {message}
            <Button remove onClick={() => setMessage('')} />
          </Notification>
        ) : (
          ''
        )}

        <LoginForm buttonLabel="Login" onSubmit={onSubmit} />
      </Box>
    </StandardPage>
  )
}

export default LoginPage
