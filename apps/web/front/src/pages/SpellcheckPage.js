import React from 'react'
import { Heading, Section } from 'react-bulma-components'
import StandardPage from '../layouts/StandardPage'
import {ZakariForm} from '@kreyolopal/web-ui'

export const SpellcheckPage = () => {
  return (
    <StandardPage lang='cpf_GP'>
      <StandardPage.Head
        title="Kreyolopal | Lòwtograf"
        description="Correcteur orthographique en ligne pour le créole."
      />
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
