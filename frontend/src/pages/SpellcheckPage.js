import React from 'react'
import { Heading } from 'react-bulma-components'
import StandardPage from '../layouts/StandardPage'
import ZakariForm from '../components/ZakariForm'

const SpellcheckPage = () => {
  return (
    <StandardPage>
      <Heading size={2} renderAs="h1">
        Check
      </Heading>

      <ZakariForm />
    </StandardPage>
  )
}

export default SpellcheckPage
