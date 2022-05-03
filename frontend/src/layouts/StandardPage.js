import React from 'react'
import { Container, Content } from 'react-bulma-components'
import TopNavbar from '../components/TopNavbar'
import findByType from '../lib/findByType'

const _Footer = () => null
const _Title = () => null

const StandardPage = ({ children, ...props }) => {
  const PageFooter = () => {
    const footer = findByType(children, _Footer)

    return (
      <Container
        max
        breakpoint="fullhd"
        textAlign="center"
        className="page-footer"
        renderAs="footer"
      >
        {footer?.props.children}
        <Content>&copy; TiMalo — 2022</Content>
      </Container>
    )
  }

  return (
    <>
      <TopNavbar />

      <Container {...props} className="main" renderAs="main">
        {children}
      </Container>

      <PageFooter />
    </>
  )
}

StandardPage.Title = _Title
StandardPage.Footer = _Footer

export default StandardPage
