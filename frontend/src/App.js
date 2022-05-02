import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ZakProvider from './components/ZakProvider'
import AccountPage from './pages/AccountPage'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SpellcheckPage from './pages/SpellcheckPage'

const App = () => {
  return (
    <div className="app">
      <ZakProvider>
        <BrowserRouter>
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
                  <AccountPage />{' '}
                </ZakProvider.Protected>
              }
            />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </BrowserRouter>
      </ZakProvider>
    </div>
  )
}

export default App
