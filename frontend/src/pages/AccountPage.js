import React from 'react'
import StandardPage from '../layouts/StandardPage'
import Account from '../components/Account'
import { useAuth } from '../components/AuthProvider'
import { Heading } from 'react-bulma-components'

const AccountPage = () => {
  const auth = useAuth()
  console.log('auth', auth)
  return (
    <StandardPage>
      <Heading size={2} renderAs="h1">
        Account
      </Heading>
      {auth.session ? (
        <Account key={auth.session.user.id} session={auth.session} />
      ) : (
        '...'
      )}
    </StandardPage>
  )
}

export default AccountPage
