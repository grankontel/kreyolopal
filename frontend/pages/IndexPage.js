import React from 'react'
import { Link } from 'react-router-dom'
import {
  Columns,
  Container,
  Heading,
  Hero,
  Image,
  Section,
} from 'react-bulma-components'
import StandardPage from '../layouts/StandardPage'
import ImageSet from '../components/ImageSet'

const IndexPage = () => {
  return (
    <StandardPage max breakpoint="fullhd">
      <StandardPage.Head
        title="Kreyolopal"
        description="Utiliser les technologies d'aujourd'hui pour encourager, améliorer et diffuser l'écriture du créole."
      />

      <Hero color="magnolia" className="index_hero" size="medium">
        <Columns>
          <Columns.Column size="half">
            <Hero.Body>
              <Heading size={1}>Kreyolopal</Heading>
              <Heading subtitle>
                Utiliser les technologies d'aujourd'hui pour encourager,
                améliorer et diffuser l'écriture du créole.
              </Heading>
            </Hero.Body>
          </Columns.Column>
          <Columns.Column size="half">
            <ImageSet
              className="app_mockup"
              src="images/black_peoples.jpeg"
              alt="People using the app"
            />
          </Columns.Column>
        </Columns>
      </Hero>
      <Container max breakpoint="fullhd">
        <Section>
          <Heading renderAs="h2" size={3}>
            Le correcteur orthographique
          </Heading>
        </Section>
      </Container>
      <StandardPage.Footer>
        <Link to="/">
          <Image
            alignContent="center"
            src="images/logo_name.svg"
            className="img-responsive logo-footer"
            alt="logo Mobile App | Themes Bootstrap"
          />
        </Link>
      </StandardPage.Footer>
    </StandardPage>
  )
}

export default IndexPage
