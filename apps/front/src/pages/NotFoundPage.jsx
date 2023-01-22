import * as React from 'react'
import { Container } from 'react-bulma-components'
import StandardPage from '../layouts/StandardPage'

// markup
const NotFoundPage = ({ location }) => {
  return (
    <StandardPage>
      <Container>
        <div className="fullImage">
          <img src="/images/404.svg" alt="Page not found" />
        </div>
      </Container>
    </StandardPage>
  )
}

export default NotFoundPage
