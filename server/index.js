const path = require('path')

// transpile imports on the fly
require('@babel/register')({
  configFile: path.resolve(__dirname, '../.babelrc'),
})

// import express server
require('./express')
