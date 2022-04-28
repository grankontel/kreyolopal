require('dotenv').config();



module.exports = {
  "development": {
    "username": process.env.DEV_POSTGRES_USERNAME,
    "password": process.env.DEV_POSTGRES_PASSWORD,
    "database": process.env.DEV_POSTGRES_DB,
    "host": process.env.DEV_POSTGRES_HOST,
    "dialect": "postgres"
  },
  "test": {
    "username": process.env.DEV_POSTGRES_USERNAME,
    "password": process.env.DEV_POSTGRES_PASSWORD,
    "database": process.env.TEST_POSTGRES_DB,
    "host": process.env.DEV_POSTGRES_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.PROD_POSTGRES_USERNAME,
    "password": process.env.PROD_POSTGRES_PASSWORD,
    "database": process.env.PROD_POSTGRES_DB,
    "host": process.env.PROD_POSTGRES_HOST,
    "dialect": "postgres"
  }
}
