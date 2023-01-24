import dicoRoutes from './api/dictionary'
import wordRoutes from './api/words'
import profileRoutes from './api/profile'
import authRoutes from './api/auth'
import spellRoutes from './api/spellcheck'
import contactRoutes from './api/contact'
const cors = require('cors')

function setRoutes({ app }) {
  // wire up to the express app
  app.use('/api/dictionary', cors(), dicoRoutes)
  app.use('/api/words', cors(), wordRoutes)
  app.use('/api/profile', cors(),profileRoutes)
  app.use('/api/spellcheck', cors(),spellRoutes)
  app.use('/api/auth', cors(),authRoutes)
  app.use('/api/contact', contactRoutes)

  return app
}

export default setRoutes
