import React, { useState } from 'react'
import StandardPage from '../layouts/StandardPage'
import { Box, Button, Heading, Notification } from 'react-bulma-components'
import { useZakari } from '../components/ZakProvider'
import RegisterForm from '../components/RegisterForm'

const RegisterPage = () => {
  const [notif, setNotif] = useState({ color: 'warning', message: '' })
  const auth = useZakari()

  const clearMessage = () => {
    setNotif({ color: notif.color, message: '' })
  }
  const onSubmit = async ({ user, setLoading }) => {
    console.log(user)
    try {
      setLoading(true)
      clearMessage()
      auth.register(user).then(
        () => {
          setNotif({ color: 'info', message: 'Inscription réussie' })
        },
        (reason) => {
          console.log(reason)
          const code = reason?.code || 500
          const msg =
            code === 500
              ? 'Erreur inconnue, veuillez essayer ultérieurement'
              : reason.error[0].msg
          setNotif({ color: 'danger', message: msg })
        }
      ).catch(err => {
        console.log(err)
      })
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


          <RegisterForm onSubmit={onSubmit} />

          <div className='notif_space' mt={1} mb={1}>
          {notif.message.length > 0 ? (
            <Notification color={notif.color}>
              {notif.message}
              <Button remove onClick={() => clearMessage()} />
            </Notification>
          ) : (
            ''
          )}
          </div>
        </Box>
      </div>
    </StandardPage>
  )
}

export default RegisterPage
