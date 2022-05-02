import React from 'react'
import { useNavigate } from 'react-router-dom'
import StandardPage from '../layouts/StandardPage'
import { Heading } from 'react-bulma-components'
import { useZakari } from '../components/ZakProvider'
import Account from '../components/Account'

const AccountPage = () => {
  const auth = useZakari()
  const navigate = useNavigate()

  return (
    <StandardPage>
      <Heading size={2} renderAs="h1">
        Account
      </Heading>
      {auth.user ? <Account /> : navigate('/')}
    </StandardPage>
  )
}

export default AccountPage
