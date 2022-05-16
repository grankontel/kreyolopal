import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StandardPage from '../layouts/StandardPage'
import {
  Box,
  Button,
  Heading,
  Notification,
  Section,
} from 'react-bulma-components'
import { useZakari } from '../components/ZakProvider'
import AccountForm from '../components/AccountForm'

const AccountPage = () => {
  const [notif, setNotif] = useState({ color: 'warning', message: '' })
  const auth = useZakari()
  const navigate = useNavigate()

  const clearMessage = () => {
    setNotif({ color: notif.color, message: '' })
  }
  const onSubmit = async ({ profile, setLoading }) => {
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
      setNotif({ color: 'danger', message: error?.error || error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <StandardPage>
      <StandardPage.Head
        title="Kreyolopal | Account"
        description="Utiliser les technologies d'aujourd'hui pour encourager, améliorer et diffuser l'écriture du créole."
      />
      <Section>
        <Heading size={2} renderAs="h1">
          Mon compte
        </Heading>
        <div className="account_box">
          <Box>
            {notif.message.length > 0 ? (
              <Notification color={notif.color}>
                {notif.message}
                <Button remove onClick={() => clearMessage()} />
              </Notification>
            ) : (
              ''
            )}

            <AccountForm onSubmit={onSubmit} />
          </Box>

          <Button.Group align="right">
            <Button
              color="warning"
              onClick={() => {
                auth.signOut().then(() => navigate('/'))
              }}
            >
              Se déconnecter
            </Button>
          </Button.Group>
        </div>
      </Section>
    </StandardPage>
  )
}

export default AccountPage
