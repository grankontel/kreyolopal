import React from 'react'
import { Container } from 'react-bulma-components'
import TopNavbar from '../components/TopNavbar'

const StandardPage = ({ children }) => {
  return (
    <>
      <header>
        <TopNavbar />
      </header>
      <Container max breakpoint="desktop" className='main' renderAs="main">
        {children}
      </Container>
      <footer className='footer' renderAs='footer'>
<Container textAlign='center'>
  &copy; TiMalo — 2022
</Container>
      </footer>
    </>
  )
}

export default StandardPage
