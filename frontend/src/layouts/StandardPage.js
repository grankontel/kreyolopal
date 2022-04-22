
import React from 'react'
import { Container } from 'react-bulma-components'
import TopNavbar from '../components/TopNavbar'

 const StandardPage = ({children}) => {
  return (
    <>
      <Container max breakpoint="desktop" renderAs="header">
        <TopNavbar />
      </Container>
      <Container max breakpoint="desktop" renderAs="main">
          {children}
      </Container>
    </>
  )
}
 

export default StandardPage
