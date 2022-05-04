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

const IndexPage = () => {
  return (
    <StandardPage max breakpoint="fullhd">
      <StandardPage.Head
        title="Kreyolopal"
        description="On aplikasyon pou konnèt lang kréyòl é kilti a pèp kréyolopal pi myé."
      />

      <Hero color="magnolia" className="index_hero" size="medium">
        <Columns>
          <Columns.Column size="half">
            <Hero.Body>
              <Heading>Kreyolopal</Heading>
              <Heading subtitle>
                On aplikasyon pou konnèt lang kréyòl é kilti a pèp kréyolopal pi
                myé.
              </Heading>
            </Hero.Body>
          </Columns.Column>
          <Columns.Column size="half">
            <Image src="images/kreol_app2.png" className="app_mockup" />
          </Columns.Column>
        </Columns>
      </Hero>
      <Container max breakpoint="desktop">
        <Section>Content</Section>
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
