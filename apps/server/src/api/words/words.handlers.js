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

const getWord = async function (req, res) {
  return wordModel.find().then((results) => res.send(results))
}

const postWord = async function (req, res) {
  const src = sanitizeEntry(req.body)

  const aWord = new wordModel(src)

  return aWord.save(function (err) {
    if (err) {
      logger.error(err)
      if (err.code === 11000) {
        return res.status(409).json({ status: 'error', error: `Entry '${src.entry}' already exists` })
      }
      return res.status(500).json({ status: 'error', error: 'Internal error' })
    }

    return res.status(201).json({
      status: 'success',
      data: { id: aWord._id },
    })
  })
}

export default { getWord, postWord }
