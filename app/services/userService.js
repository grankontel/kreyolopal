const logger = require('./logger')
const authService = require('./authService')
const sequelize = require('./db')
const user = require('../models/user')

const userService = {
    /**
     * Find a user by his email
     * @param {string} email Email of the user to find
     */
  findbyEmail: (email) => {
    return user
      .findOne({ where: { email: email } })
      .then(
        (record) => {
          return record
        },
        (reason) => {
          logger.error(reason)
          return null
        }
      )
      .catch((error) => {
        logger.error(error)
        return null
      })
  },

  register: (record) => {
    return new Promise((resolve, reject) => {
      sequelize.sync().then(
        () => {
          let myrecord = record
          myrecord.emailveriftoken = authService.generateVerifToken()

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
              console.log(_record)
              user
                .create(_record)
                .then(
                  (aUser) => resolve(aUser),
                  (reason) => reject(reason)
                )
                .catch((error) => {
                  logger.error(error)
                  reject(error)
                })
            })
        },
        (reason) => reject(reason)
      )
    })
  },
}

module.exports = userService
