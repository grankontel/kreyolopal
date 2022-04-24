require('dotenv').config();

const config = {
 app: {
   port: process.env.APP_PORT
 },
 db: {
  connectionString: process.env.MONGOBD_CONNECTIONSTRING,
 },
 mail: {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  host: process.env.MAILGUN_HOST,
  from: process.env.MAILGUN_FROM,
  listKey: process.env.MAILIST_API_KEY,
  listId: process.env.MAILIST_LISTID
 },
 security: {
  salt: process.env.API_SALT,
  memoryCost: Number(process.env.ARGON_MEMORYCOST || 24),
  hashLength: Number(process.env.ARGON_LENGTH || 24),
  iterations: Number(process.env.ARGON_ITERATIONS || 2),
  captchaKey: process.env.CAPTCHA_SECRET_KEY

 },
 log : {
    level: process.env.LOGLEVEL || 'info',
    prettyPrint: false
  },
  auth: {
    secret: process.env.SESSION_SECRET,
    duration: process.env.SESSION_DURATION
  }
};

module.exports = config;