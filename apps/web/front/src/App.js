import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ZakProvider } from '@kreyolopal/react-zakari';
import IndexPage from './pages/IndexPage';
import AccountPage from './pages/AccountPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SpellcheckPage from './pages/SpellcheckPage';
import VerifiedPage from './pages/VerifiedPage';

const PwdResetPage = React.lazy(() =>
  import(/* webpackChunkName: "pwdReset" */ './pages/PwdResetPage')
);
const ChangePwdPage = React.lazy(() =>
  import(/* webpackChunkName: "pwdReset" */ './pages/ChangePwdPage')
);

function App() {
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

          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verified" element={<VerifiedPage />} />

          <Route path="/resetpwd">
            <Route
              path="request"
              element={
                <Suspense fallback={<div>Chargement...</div>}>
                  <PwdResetPage />
                </Suspense>
              }
            />
            <Route
              path=":token"
              element={
                <Suspense fallback={<div>Chargement...</div>}>
                  <ChangePwdPage />
                </Suspense>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ZakProvider>
    </HelmetProvider>
  );
}

export default App;