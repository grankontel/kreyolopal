import React, { useState } from 'react'
import {
  Box,
  Button,
  Heading,
  Notification,
  Section,
} from 'react-bulma-components'
import FormField from '../components/FormField'
import { useZakari } from '../components/ZakProvider'
import StandardPage from '../layouts/StandardPage'

const PwdResetPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [notif, setNotif] = useState({ color: 'warning', message: '' })
  const auth = useZakari()

  const clearMessage = () => {
    setNotif({ color: notif.color, message: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      clearMessage()

      auth.requestResetPwd(email).then(
        () => {
          setNotif({
            color: 'info',
            message:
              'Si ou ni on kont, ou ké wousouvwè on mésaj ka di-w sa pou fè pou chanjé modpas a-w.',
          })
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
      setNotif({ color: 'danger', message: error?.error || error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StandardPage lang="cpf_GP">
      <StandardPage.Head
        title="Kreyolopal | Password reset"
        description="Correcteur orthographique en ligne pour le créole."
      />
      <Section>
        <Heading size={2} renderAs="h1">
          Éfasé modpas an-mwen
        </Heading>
        <div className="login_form">
          <Box>
            {notif.message.length > 0 ? (
              <Notification color={notif.color}>
                {notif.message}
                <Button remove onClick={() => clearMessage()} />
              </Notification>
            ) : (
              ''
            )}

            <form onSubmit={handleSubmit}>
              <FormField
                label="Email"
                name="email"
                type="email"
                value={email}
                autoComplete="email"
                setValue={setEmail}
              />
              <Button.Group align="right">
                <Button color="primary" loading={isLoading}>
                  Changer mon mot de passe
                </Button>
              </Button.Group>
            </form>
          </Box>
        </div>
      </Section>
    </StandardPage>
  )
}

export default PwdResetPage
