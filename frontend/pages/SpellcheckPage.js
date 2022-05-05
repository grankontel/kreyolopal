import React from 'react'
import { Heading, Section } from 'react-bulma-components'
import StandardPage from '../layouts/StandardPage'
import ZakariForm from '../components/ZakariForm'

const SpellcheckPage = () => {
  return (
    <StandardPage>
      <Section>
      <Heading size={2} renderAs="h1">
        Lòwtograf
      </Heading>
        <ZakariForm />
      </Section>
    </StandardPage>
  )
}

export default SpellcheckPage
