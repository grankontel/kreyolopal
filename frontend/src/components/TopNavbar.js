import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from 'react-bulma-components'
import { useZakari } from './ZakProvider'
const classNames = require('classnames')

const useToggle = (initialState = false) => {
  // Initialize the state
  const [state, setState] = useState(initialState)

  // Define and memorize toggler function in case we pass down the comopnent,
  // This function change the boolean value to it's opposite value
  const toggle = useCallback(() => setState((state) => !state), [])

  return [state, toggle]
}

const TopNavbar = () => {
  const auth = useZakari()
  const [mobileOpen, openMobileMenu] = useToggle(false)
  const navMenu = classNames({
    'is-active': mobileOpen,
  })

  return (
    <Navbar color="primary" fixed="top">
      <Navbar.Brand>
        <Navbar.Item href="/" renderAs="li">
          <img
            src="/Zakari-Mark-Light-32px.png"
            width="32"
            height="32"
            alt="Zakari Brand"
          />
        </Navbar.Item>
        <Navbar.Item renderAs="li">
          <Link to="/">Home</Link>
        </Navbar.Item>
      </Navbar.Brand>

      <Navbar.Burger onClick={openMobileMenu} aria-label="menu" />
      <Navbar.Menu renderAs="div" className={navMenu}>
        <Navbar.Container align="right">
          {auth.user ? (
            <>
              <Navbar.Item href="/spellcheck">Korije</Navbar.Item>
              <Navbar.Item href="/account">Account</Navbar.Item>
            </>
          ) : (
            <>
              <Navbar.Item href="/login">Sign In</Navbar.Item>
              <Navbar.Item href="/register">Register</Navbar.Item>
            </>
          )}
        </Navbar.Container>
      </Navbar.Menu>
    </Navbar>
  )
}

export default TopNavbar
