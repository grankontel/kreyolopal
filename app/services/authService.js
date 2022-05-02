const config = require('../config')
const argon2 = require('argon2')
const { SHA3 } = require('sha3')
const logger = require('./logger')

const argonOptions = {
  type: argon2.argon2i,
  memoryCost: config.security.memoryCost,
  hashLength: config.security.hashLength,
  timeCost: config.security.iterations,
}

/**
 * Generate a hash
 * @param {string} data the data to make the hash for
 */
function generateHash(data) {
  const hash = new SHA3(256)

  hash.update(data)
  return hash.digest('hex')
}

const authService = {
  generateVerifToken: (userpart) => {
    let stamp = Date.now()
    return generateHash(`${stamp}:${userpart}:${config.security.token}`)
  },

  /**
   * Hash the provided plain password
   * @param {string} plain Plain password
   * @returns hashed password
   */
  hashPassword: async (plain) => {
    return (res = await argon2.hash(plain, config.security.salt, argonOptions))
  },

  /**
   * Verify the provided password against the hashed one
   * @param {string} recpassword Recorded password (hashed)
   * @param {string} plainpwd Plain password
   * @returns true if password match
   */
  verifyPassword: async (recpassword, plainpwd) => {
    logger.info('Verifying password...')

    return (res = await argon2.verify(recpassword, plainpwd, argonOptions))
  },
}

module.exports = authService
