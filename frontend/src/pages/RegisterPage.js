import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StandardPage from '../layouts/StandardPage'
import { Box, Button, Heading, Notification } from 'react-bulma-components'
import { useZakari } from '../components/ZakProvider'
import RegisterForm from '../components/RegisterForm'

const RegisterPage = () => {
  const [notif, setNotif] = useState({ color: 'warning', message: '' })
  const auth = useZakari()
  const navigate = useNavigate()

  const clearMessage = () => {
    setNotif({ color: notif.color, message: '' })
  }
  const onSubmit = async ({ profile, setLoading }) => {
    console.log(profile)
    try {
      setLoading(true)
      clearMessage()
      auth.setProfile(profile).then(
        () => {
          setNotif({ color: 'info', message: 'Mise à jour réussie' })
        },
        (reason) => {
          const code = reason?.code || 500
          const msg =
            code === 500
              ? 'Erreur inconnue, veuillez essayer ultérieurement'
              : reason
          setNotif({ color: 'danger', message: msg })
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
      <Heading size={2} renderAs="h1">
        Register
      </Heading>
      <div className="register_box">
        <Box>
          {notif.message.length > 0 ? (
            <Notification color={notif.color}>
              {notif.message}
              <Button remove onClick={() => clearMessage()} />
            </Notification>
          ) : (
            ''
          )}

          <RegisterForm onSubmit={onSubmit} />
        </Box>
      </div>
    </StandardPage>
  )
}

export default RegisterPage
