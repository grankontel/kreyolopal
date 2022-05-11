require('dotenv').config()

const config = {
  app: {
    port: process.env.PORT,
  },
  dico: {
    useLocal: process.env.LOCAL_DICO,
  },
  aws: {
    keyId: process.env.AWS_ACCESS_KEY_ID,
    keySecret: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_BUCKET_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  db: {
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
  },
  mail: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    host: process.env.MAILGUN_HOST,
    from: process.env.MAILGUN_FROM,
    listKey: process.env.MAILIST_API_KEY,
    listId: process.env.MAILIST_LISTID,
  },
  security: {
    salt: process.env.API_SALT,
    token: process.env.TOKEN_SALT,
    memoryCost: Number(process.env.ARGON_MEMORYCOST || 24),
    hashLength: Number(process.env.ARGON_LENGTH || 24),
    iterations: Number(process.env.ARGON_ITERATIONS || 2),
    captchaKey: process.env.CAPTCHA_SECRET_KEY,
  },
  log: {
    level: process.env.LOGLEVEL || 'info',
    prettyPrint: false,
  },
  auth: {
    secret: process.env.SESSION_SECRET,
    duration: process.env.SESSION_DURATION,
  },
}

module.exports = config
