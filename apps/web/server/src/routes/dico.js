const express = require('express')
const config = require('../config')
const { MongoClient, ObjectID } = require('mongodb')

const dico_route = ({ logger }) => {
  const router = express.Router()
  const client = new MongoClient(config.mongodb.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  router.get('/dictionary/:language/:word', async (req, res) => {
    const language = req.params.language
    const word = req.params.word

    const filter = {
      entry: word,
    }
    const projection = {
      entry: 1,
      definitions: 1,
    }
    const coll = client.db('dico_poullet').collection('words')
    const cursor = coll.find(filter, { projection })
    const result = await cursor.toArray()
    const data = result.map((item) => {
      return {
        id: item._id,
        entry: item.entry,
        definitions: item.definitions[language],
      }
    })
    res.set('Content-Type', 'application/json')
    res.status(200).send(data)
  })

  router.get('/suggest/:word', async (req, res) => {
    const word = req.params.word

    const filter = {
      variations: new RegExp(`^${word}`, 'i'),
    }
    const projection = {
      entry: 1,
    }
    const coll = client.db('dico_poullet').collection('words')
    const cursor = coll.find(filter, { projection })
    const result = await cursor.toArray()
    res.set('Content-Type', 'application/json')
    res.status(200).send(result)
  })

  logger.info('\tAdding route "dico"...')
  return router
}

module.exports = dico_route
