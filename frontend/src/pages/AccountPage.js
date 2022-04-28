import React from 'react'
import StandardPage from '../layouts/StandardPage'
import { Heading, Button } from 'react-bulma-components'
import { useZakari } from '../components/ZakProvider'
import { useNavigate } from 'react-router-dom'

const AccountPage = () => {
  const auth = useZakari()
  const navigate = useNavigate()
  console.log('auth', auth)
  return (
    <StandardPage>
      <Heading size={2} renderAs="h1">
        Account
      </Heading>
      {/*       {auth.session ? (
        <Account key={auth.session.user.id} session={auth.session} />
      ) : (
        '...'
      )}
 */}
      <Button
        color="warning"
        onClick={() => auth.signOut().then(() => navigate('/'))}
      >
        Sign Out
      </Button>
    </StandardPage>
  )
}

export default AccountPage
