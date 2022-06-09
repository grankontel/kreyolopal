import React from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Routes, Route } from 'react-router-dom'
import ZakProvider from './components/ZakProvider'
import AccountPage from './pages/AccountPage'
import ChangePwdPage from './pages/ChangePwdPage'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFound'
import PwdResetPage from './pages/PwdResetPage'
import RegisterPage from './pages/RegisterPage'
import SpellcheckPage from './pages/SpellcheckPage'
import VerifiedPage from './pages/VerifiedPage'

export const App = () => {
  return (
    <HelmetProvider>
      <ZakProvider>
        <Routes>
          <Route index element={<IndexPage />} />
          <Route
            path="/spellcheck"
            element={
              <ZakProvider.Protected to="/login">
                <SpellcheckPage />
              </ZakProvider.Protected>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/account"
            element={
              <ZakProvider.Protected to="/login">
                <AccountPage />
              </ZakProvider.Protected>
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verified" element={<VerifiedPage />} />

          <Route path="/resetpwd">
            <Route path='request' element={<PwdResetPage />} />
            <Route path=":token" element={<ChangePwdPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ZakProvider>
    </HelmetProvider>
  )
}
