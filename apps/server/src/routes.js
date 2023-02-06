import dicoRoutes from './api/dictionary'
import wordRoutes from './api/words'
import profileRoutes from './api/profile'
import authRoutes from './api/auth'
import spellRoutes from './api/spellcheck'
import contactRoutes from './api/contact'
import logger from './services/logger'
const cors = require('cors')

function adminMiddleware(req, res, next) {
  if (!req.user?.is_admin) {
    logger.error(`${req.user?.firstname} ${req.user?.lastname} is not admin`)
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Unauthorized',
      error: new Error('Unauthorized'),
    })
  }
  next()
}

function setRoutes({ app }) {
  // wire up to the express app
  app.use('/api/dictionary', cors(), dicoRoutes)
  app.use('/api/words', cors(), adminMiddleware, wordRoutes)
  app.use('/api/profile', cors(), profileRoutes)
  app.use('/api/spellcheck', cors(), spellRoutes)
  app.use('/api/auth', cors(), authRoutes)
  app.use('/api/contact', contactRoutes)

  return app
}

export default setRoutes
