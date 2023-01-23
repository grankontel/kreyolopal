import { useCallback, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Navbar } from 'react-bulma-components'
import { useZakari } from '@kreyolopal/react-zakari'
import SimpleSearchBox from './SimpleSearchBox'
import classNames from 'classnames';

const useToggle = (initialState = false) => {
  // Initialize the state
  const [state, setState] = useState(initialState)

  // Define and memorize toggler function in case we pass down the comopnent,
  // This function change the boolean value to it's opposite value
  const toggle = useCallback(() => setState((state) => !state), [])

  return [state, toggle]
}

export const TopNavbar = () => {
  const [isLoggedIn, setLoggedIn] = useState(false)
  const auth = useZakari()
  const navigate = useNavigate()
  const [mobileOpen, openMobileMenu] = useToggle(false)
  const navMenu = classNames({
    'is-active': mobileOpen,
  })

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (auth !== null) {
      setLoggedIn(auth?.isLoggedIn() )
    }
  }, [auth?.user])
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <Navbar color="dark" className="navbar_top">
      <Navbar.Brand>
        <Navbar.Item href="/" renderAs="li">
          <img src="/images/logo_name.svg" alt="Zakari Brand" />
        </Navbar.Item>
        <Navbar.Item renderAs="li">
          <Link to="/">Accueil</Link>
        </Navbar.Item>
      </Navbar.Brand>
      <Navbar.Item>
        <SimpleSearchBox />
      </Navbar.Item>

      <Navbar.Burger onClick={openMobileMenu} aria-label="menu" />
      <Navbar.Menu renderAs="div" className={navMenu}>
        <Navbar.Container align="right">

          {isLoggedIn ? (
            <>
              <Navbar.Item href="/spellcheck">Korije</Navbar.Item>
              <Navbar.Item href="/account">Compte</Navbar.Item>
              <Navbar.Item>
                <Button
                  outlined
                  colorVariant="light"
                  onClick={async () => {
                    try {
                      await auth.signOut()
                    } finally {
                      navigate('/')
                    }
                  }}
                >
                  Se déconnecter
                </Button>
              </Navbar.Item>
            </>
          ) : (
            <>
              <Navbar.Item href="/login">
                <Button outlined colorVariant="light">
                  Se connecter
                </Button>
              </Navbar.Item>
              <Navbar.Item href="/register">S'inscrire</Navbar.Item>
            </>
          )}
          <Navbar.Item href="/contact">Contact</Navbar.Item>
        </Navbar.Container>
      </Navbar.Menu>
    </Navbar>
  )
}

export default TopNavbar
