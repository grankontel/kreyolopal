const express = require('express')
const config = require('../config')
const Wabap = require('../services/wabapService')

const wabap_route = ({ logger }) => {
  const router = express.Router()

  const getRedisCredentials = () => {
    const redisUri = new URL(config.redis.url)
    return {
      host: redisUri.hostname,
      port: redisUri.port,
      password: redisUri.password,
      db: Number(config.redis.db),
    }
  }

  const _wabap =  Wabap({ dbConnection: getRedisCredentials() })

  /**
   * Fetches a portion of the articles indices that match the provided language and word.
   *
   * @param  {string} language  The language of the specified word
   * @param  {string} word      The word prefix to search for
   * @param  {string} part      The portion 0-based index of article indices, grouped by 10
   *
   * Example: (GET) /api/v1/articles/indices/gp/abo/0
   *
   * Will fetch the 10 first article indices that match the Gudeloupean Creole
   * with a word starting with "abo" (note that this word will be filtered
   * — especially (but not limited to) removing the diacritics — before Wabap
   * starts to search for the indices).
   * The result is a JSON string with the following format :
   *
   * {
   *   count: 23,
   *   sample: [
   *     { id:42, wfs:["aboli"] },
   *     { id:44, wfs:["aboutsouf", ...] },
   *     ...
   *   ]
   * }
   *
   * Where "count" is the number of the all matching article indices
   * (not only those returned in the sample), "id" is an article ID
   * and the "wfs" items are the written words for this article.
   *
   */
  router.get('/articles/indices/:language/:word/:part', async (req, res) => {
    try {
      /*
          // Secure access
          if ( ! checkAuthentication(req, res) ||
               ! checkPermissions(req, res) ) {
            return
          }
    */
      const language = req.params.language
      const word = req.params.word
      const part = req.params.part

      const indices = await _wabap.suggestArticles({
        language: language,
        word: word,
        part: part,
      })

      logger.info(`indices : ${JSON.stringify(indices)}`)
      res.status(200).json(indices)
    } catch (err) {
      console.error(err)
      res.status(502).json(err)
    }
  })

  /**
   * Fetches the article identified by its ID.
   * Example: (GET) /api/articles/12
   */
  router.get('/articles/:id', async (req, res) => {
    try {
      /*
          // Secure access
          if ( ! checkAuthentication(req, res) ||
               ! checkPermissions(req, res) ) {
            return
          }
    */
      const id = req.params.id

      const article = await _wabap.getArticle(id)
      res.set('Content-Type', 'application/json')
      res.status(200).send(article)
    } catch (err) {
      res.status(502).json(err)
    }
  })

  logger.info('\tAdding route "wabap"...')
  return router
}

module.exports = wabap_route
