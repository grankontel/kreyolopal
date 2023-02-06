import dicoRoutes from './api/dictionary'
import wordRoutes from './api/words'
import profileRoutes from './api/profile'
import authRoutes from './api/auth'
import spellRoutes from './api/spellcheck'
import contactRoutes from './api/contact'
import adminMiddleware from './middlewares/admin.middleware'

const cors = require('cors')

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
