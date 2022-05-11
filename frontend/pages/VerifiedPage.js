import React from 'react'
import { Heading, Section } from 'react-bulma-components'
import StandardPage from '../layouts/StandardPage'

const VerifiedPage = () => {
  return (
    <StandardPage lang="cpf_GP">
      <StandardPage.Head
        title="Kreyolopal | Compte vérifié"
        description="Correcteur orthographique en ligne pour le créole."
      />
      <Section>
        <Heading size={2} renderAs="h1">
          Merci !
        </Heading>
        Votre compte est vérifié
      </Section>
    </StandardPage>
  )
}

export default VerifiedPage
