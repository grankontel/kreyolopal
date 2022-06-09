import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StandardPage from '../layouts/StandardPage'
import {
  Box,
  Button,
  Columns,
  Heading,
  Notification,
  Panel,
} from 'react-bulma-components'
import { useZakari } from '../components/ZakProvider'
import FeatherIcon from '../components/FatherIcon'
import AccountForm from '../components/Forms/AccountForm'
import UpdPwdForm from '../components/Forms/UpdPwdForm'

const AccountPage = () => {
  const [notif, setNotif] = useState({ color: 'warning', message: '' })
  const [notifPwd, setNotifPwd] = useState({ color: 'warning', message: '' })
  const auth = useZakari()
  const navigate = useNavigate()

  const clearMessage = () => {
    setNotif({ color: notif.color, message: '' })
    setNotifPwd({ color: 'warning', message: '' })
  }

  const onProfileSubmit = async ({ profile, setLoading }) => {
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

  const onUpdatePwdSubmit = async ({ data, setLoading }) => {
    try {
      setLoading(true)
      clearMessage()
      auth
        .updatePassword(
          data.currentPassword,
          data.newPassword,
          data.verification
        )
        .then(
          () => {
            setNotifPwd({ color: 'info', message: 'Mise à jour réussie' })
          },
          (reason) => {
            const code = reason?.code || 500
            const msg =
              code === 500
                ? 'Erreur inconnue, veuillez essayer ultérieurement'
                : reason
            setNotifPwd({ color: 'danger', message: msg })
          }
        )
    } catch (error) {
      setNotifPwd({ color: 'danger', message: error?.error || error })
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
      <div className='main_content'>

      <Heading size={2} renderAs="h1">
        Mon compte
      </Heading>

      <Columns>
        <Columns.Column size="one-fifth">
          <Panel className='side_menu'>
            <Panel.Block>
              <a href="#profile">
                <Panel.Icon>
                  <FeatherIcon iconName="user" />
                </Panel.Icon>
                <span>Mon profil</span>
              </a>
            </Panel.Block>

            <Panel.Block>
              <a href="#changePassword">
                <Panel.Icon>
                  <FeatherIcon iconName="shield-off" />
                </Panel.Icon>
                <span>Changer le mot de passe</span>
              </a>
            </Panel.Block>

            <Panel.Block>
              <Button
                color="primary"
                fullwidth
                onClick={() => {
                  auth.signOut().then(() => navigate('/'))
                }}
              >
                Se déconnecter
              </Button>
            </Panel.Block>
          </Panel>
        </Columns.Column>
        <Columns.Column size="four-fifths" className='page_content'>
          <section>
            <Heading  id="profile" size={3} renderAs="h2">
                Mon profil
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

                <AccountForm onSubmit={onProfileSubmit} />
              </Box>
            </div>
          </section>
          <section>
            <Heading size={3}  id="changePassword" renderAs="h2">
                Changer mon mot de passe
            </Heading>
            <div className="account_box">
              <Box>
                {notifPwd.message.length > 0 ? (
                  <Notification color={notifPwd.color}>
                    {notif.message}
                    <Button remove onClick={() => clearMessage()} />
                  </Notification>
                ) : (
                  ''
                )}

                <UpdPwdForm onSubmit={onUpdatePwdSubmit} />
              </Box>
            </div>
          </section>
        </Columns.Column>
      </Columns>
      </div>

    </StandardPage>
  )
}

export default AccountPage
