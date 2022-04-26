import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from 'react-bulma-components'
import { useAuth } from './AuthProvider'
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
  const auth = useAuth()
  const [mobileOpen, openMobileMenu] = useToggle(false)
  const navMenu = classNames({
    'is-active': mobileOpen,
  })

  console.log(auth)
  return (
    <Navbar color="primary" fixed='top'>
      <Navbar.Brand>
        <div className="logo_text">
          <Link to="/">
            <h1 className="logo_title">Zakari</h1>
          </Link>
          <h2 className="logo_subtitle">On zouti pou korijé kréyòl maké</h2>
        </div>
      </Navbar.Brand>

      <Navbar.Burger onClick={openMobileMenu} aria-label="menu" />
      <Navbar.Menu renderAs="div" className={navMenu}>
        <Navbar.Container align="right">
          <Navbar.Item href="/">Home</Navbar.Item>
          {auth.user ? (
            <Navbar.Item href="/account">Account</Navbar.Item>
          ) : (
            <Navbar.Item href="/login">Sign In</Navbar.Item>
          )}
        </Navbar.Container>
      </Navbar.Menu>
    </Navbar>
  )
}

export default TopNavbar
