import dicoRoutes from './api/dictionary'
import profileRoutes from './api/profile'
import authRoutes from './api/auth'
import spellRoutes from './api/spellcheck'
import contactRoutes from './api/contact'
const cors = require('cors')

function setRoutes({ app }) {
  // wire up to the express app
  app.use('/api/dictionary', cors(), dicoRoutes)
  app.use('/api/profile', cors(),profileRoutes)
  app.use('/api/spellcheck', cors(),spellRoutes)
  app.use('/api/auth', cors(),authRoutes)
  app.use('/api/contact', contactRoutes)

  return app
}

export default setRoutes
