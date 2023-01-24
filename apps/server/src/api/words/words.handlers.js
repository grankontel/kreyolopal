import logger from '../../services/logger'
import config from '../../config'
import mongoose from 'mongoose'
import { wordModel } from './words'

const sanitizeEntry = (src) => {
  src.entry = src.entry.trim().toLowerCase()
  src.variations = src.variations.map((item) => item.trim().toLowerCase())
  for (const [key, value] of Object.entries(src.definitions)) {
    value.forEach((el) => {
      el.nature = el.nature.map((item) => item.trim().toLowerCase())
      el.synonyms = el.synonyms.map((item) => item.trim().toLowerCase())
    })
  }
  return src
}

const getWord = async function (req, res) {
  return mongoose
    .connect(config.mongodb.uri, { useNewUrlParser: true })
    .then(() => wordModel.find().then((results) => res.send(results)))
}

const postWord = async function (req, res) {
  const src = sanitizeEntry(req.body)

  const aWord = new wordModel(src)

  return mongoose
    .connect(config.mongodb.uri, { useNewUrlParser: true })
    .then(() =>
      aWord.save(function (err) {
        if (err) {
          logger.error(err)
          return res
            .status(500)
            .json({ status: 'error', error: 'Internal error' })
        }

        return res.status(201).json({
          status: 'success',
          data: { id: aWord._id },
        })
      })
    )
}

export default { getWord, postWord }
