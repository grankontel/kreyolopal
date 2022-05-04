const express = require('express')
const path = require('path')
const fs = require('fs')

// ignore `.scss` imports
require('ignore-styles')

// transpile imports on the fly
require('@babel/register')({
  configFile: path.resolve(__dirname, '../.babelrc'),
})

const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { StaticRouter } = require('react-router-dom/server')
const { App } = require('../frontend/app')

const srcFile = path.resolve(__dirname, '../dist/index.html')

const reactRoute = (req, res) => {
  // read `index.html` file
  let indexHTML = fs.readFileSync(srcFile, {
    encoding: 'utf8',
  })

  if (indexHTML?.length === 0) {
    console.log(`cannot read ${srcFile}`)
  }

  // get HTML string from the `App` component
  let appHTML = ReactDOMServer.renderToString(
    <StaticRouter location={req.originalUrl}>
      <App />
    </StaticRouter>
  )

  // populate `#app` element with `appHTML`
  indexHTML = indexHTML.replace(
    '<div id="app"></div>',
    `<div id="app">${appHTML}</div>`
  )

  // set header and status
  res.contentType('text/html')
  res.status(200)

  return res.send(indexHTML)
}

module.exports = reactRoute
