import { validationResult } from 'express-validator'
import logger from '../../services/logger'
import config from '../../config'
import { wordModel } from './words'

const sanitizeEntry = (src) => {
  src.entry = src.entry.trim()
  src.variations = src.variations.map((item) => item.trim().toLowerCase())
  if (!src.variations.includes(src.entry))
    src.variations = src.variations.unshift(src.entry)

  for (const [key, value] of Object.entries(src.definitions)) {
    value.forEach((el) => {
      el.nature = el.nature.map((item) => item.trim().toLowerCase())
      el.synonyms = el.synonyms.map((item) => item.trim().toLowerCase())
    })
  }
  return src
}

const getWords = async function (req, res) {
  var filterObj = {}
  if (req.query?.filter) {
    try {
      logger.info(`filter = ${req.query.filter}`)
      filterObj = JSON.parse(req.query.filter)
      logger.info(`filtering on ${JSON.stringify(filterObj)}`)
    } catch (e) {
      logger.error(`Error on parsing filter query elements : ${e}`)
    }
  }

  var findPromise = wordModel.find(filterObj)
  if (req.query?.range) {
    try {
      logger.info(`range  = ${req.query.range}`)
      const [offset, limit] = JSON.parse(req.query.range)
      findPromise = offset > 0 ? findPromise.skip(offset) : findPromise
      findPromise = findPromise.limit(limit)
      logger.info(`range is from ${offset} to ${limit}`)
    } catch (e) {
      logger.error(`Error on parsing range query elements : ${e}`)
      findPromise = findPromise.limit(10)
    }
  }
  if (req.query?.sort) {
    try {
      logger.info(`sort  = ${req.query.sort}`)
      const [field, order] = JSON.parse(req.query.sort)
      var sortObj = {}
      sortObj[field] = order == 'ASC' ? 1 : -1
      findPromise = findPromise.sort(sortObj)
      logger.info(`sorting by ${JSON.stringify(sortObj)}`)
    } catch (e) {
      logger.error(`Error on parsing sort query elements : ${e}`)
    }
  }
  return findPromise
    .then(
      (results) => {
        if (results === null)
          return res.status(404).json({
            status: 'error',
            code: 404,
            message: 'Not Found',
            error: new Error('Not Found'),
          })

        return res.send(results.map((x) => x.toClient()))
      },
      (reason) => {
        logger.error(reason)
        return res.status(500).send({ status: 'error', error: [reason] })
      }
    )
    .catch((_error) => {
      res.status(500).send({ status: 'error', error: [_error] })
    })
}

const getOneWord = async function (req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() })
  }

  const id = req.params.id
  return wordModel
    .findById(id)
    .then(
      (results) => {
        if (results === null)
          return res.status(404).json({
            status: 'error',
            code: 404,
            message: 'Not Found',
            error: new Error('Not Found'),
          })

        return res.send(results.toClient())
      },
      (reason) => {
        logger.error(reason)
        return res.status(500).send({ status: 'error', error: [reason] })
      }
    )
    .catch((_error) => {
      res.status(500).send({ status: 'error', error: [_error] })
    })
}

const postWord = async function (req, res) {
  const src = sanitizeEntry(req.body)

  const aWord = new wordModel(src)

  return aWord.save(function (err) {
    if (err) {
      logger.error(err)
      if (err.code === 11000) {
        return res.status(409).json({
          status: 'error',
          error: `Entry '${src.entry}' already exists`,
        })
      }
      return res.status(500).json({ status: 'error', error: 'Internal error' })
    }

    return res.status(201).json({
      status: 'success',
      data: { id: aWord._id },
    })
  })
}

export default { getWords, getOneWord, postWord }
