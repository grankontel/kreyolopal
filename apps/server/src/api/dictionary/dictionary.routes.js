import dicoHandlers from './dictionary.handlers'
const express = require('express')
const dicoRoutes = express.Router()

// get suggestion
dicoRoutes.get('/suggest/:word', dicoHandlers.getSuggestion)

// get specific word
dicoRoutes.get('/:language/:word', dicoHandlers.getWord)

export default dicoRoutes
