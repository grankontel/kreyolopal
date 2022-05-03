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
      <Hero color="primary" size="medium">
        <Hero.Body>
          <Columns>
            <Columns.Column size="one-third">
              <Heading>Kreyolopal</Heading>
              <Heading subtitle>
                On aplikasyon pou konnèt lang kréyòl é kilti a pèp kréyolopal pi
                myé.
              </Heading>
            </Columns.Column>
          </Columns>
        </Hero.Body>
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
