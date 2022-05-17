const Promise = require('bluebird')
const logger = require('./logger')
const authService = require('./authService')
const db = require('../database/models')

const { sequelize } = db
const user = db.User

const userService = {
  /**
   * Find a user by his email
   * @param {string} email Email of the user to find
   */
  findbyEmail: (email) =>
    user
      .findOne({ where: { email } })
      .then(
        (record) => record,
        (reason) => {
          logger.error(reason)
          return null
        }
      )
      .catch((error) => {
        logger.error(error)
        return null
      }),

  register: (record) =>
    new Promise((resolve, reject) => {
      sequelize.sync().then(
        () => {
          const myrecord = record
          myrecord.email_verif_token = authService.generateVerifToken(
            record.email
          )

          authService
            .hashPassword(record.password)
            .then(
              (hashedpwd) => {
                myrecord.password = hashedpwd
                return myrecord
              },
              (error) => reject(error)
            )
            .then((_record) => {
              user
                .create(_record)
                .then(
                  (aUser) => {
                    resolve(aUser)
                  },
                  (reason) => {
                    logger.error('register rejected')
                    reject(reason.errors[0].message)
                  }
                )
                .catch((error) => {
                  logger.error('register exception')
                  reject(error)
                })
            })
        },
        (reason) => reject(reason)
      )
    }),
}

module.exports = userService
