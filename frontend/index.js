import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app'
import './styles/mystyles.sass'

if (process.env.NOSSR) {
  const root = ReactDOM.createRoot(document.getElementById('app'))
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
} else {
  ReactDOM.hydrateRoot(
    document.getElementById('app'),
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

/*
const root = ReactDOM.createRoot(document.getElementById('app'))
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
*/
