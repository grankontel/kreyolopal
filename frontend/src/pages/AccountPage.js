import React from 'react'
import StandardPage from '../layouts/StandardPage'
import Account from '../components/Account'
import { useAuth } from '../components/AuthProvider'

const AccountPage = () => {
  const auth = useAuth()
  console.log('auth', auth)
  return (
    <StandardPage>
      {auth.session ? (
        <Account key={auth.session.user.id} session={auth.session} />
      ) : (
        '...'
      )}
    </StandardPage>
  )
}

export default AccountPage
