const axios = require('axios').default
var jwt = require('jsonwebtoken')

function bindMethods() {
  Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((key) => {
    if (this[key] instanceof Function && key !== 'constructor')
      this[key] = this[key].bind(this)
  })
}

class ZakariClient {
  constructor(host) {
    this.host = host
    this.user = null
    this._onUserChange = null
    this._cookies = []
    this._authorization = ''

    bindMethods.call(this)
  }

  _clean() {
    this._cookies = []
    this._authorization = ''
    this._setAuthenticated(null)
  }

  _setAuthenticated(pUser) {
    this.user = pUser
    localStorage.setItem('zakariClient', JSON.stringify(this))
    if (typeof this._onUserChange === 'function') {
      this._onUserChange(this, pUser)
    }
  }

  onUserChange(callback) {
    this._onUserChange = callback
  }

  /**
   * Log in to zakari api
   * @param {string} email The user email
   * @param {string} password The user password
   * @returns the logged in user on success, false otherwise
   */
  signIn(email, password) {
    const me = this
    return new Promise((resolve, reject) => {
      return axios
        .post(
          `${me.host}/api/auth/login`,
          {
            email: email,
            password: password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(
          (result) => {
            if (result.headers['set-cookie']?.length) {
              Array.prototype.push.apply(
                me._cookies,
                result.headers['set-cookie'].map((x) => x.split(';')[0])
              )
            }
            const rep = result.data
            me._authorization = rep.data.jwt
            var decoded = jwt.decode(rep.data.jwt)
            me._setAuthenticated(decoded.user)
            return resolve(me)
          },
          (reason) => {
            const data = reason.response.data
            data.code = reason.response.status
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * Log out of Zakari api
   * @returns
   */
  signOut() {
    const me = this
    return new Promise((resolve, reject) => {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: me._authorization,
      }
      return axios
        .post(
          `${me.host}/api/auth/logout`,
          {},
          {
            headers,
            withCredentials: true,
          }
        )
        .then(
          (result) => {
            const rep = result.data
            this._clean()
            resolve(rep)
          },
          (reason) => {
            const data = reason.response.data
            data.code = reason.response.status
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * @typedef {Object} SpellcheckMessage
   * @property {number} status - The X Coordinate
   * @property {string} kreyol - The kreyol used
   * @property {Array<string>} unknown_words - List of unrecognized words in the request
   * @property {string} message - The spellchecked result
   */

  /**
   * @typedef {Object} ZakariResponse
   * @property {number} user - A user id
   * @property {string} tool - Tool used to query
   * @property {string} service - The service called
   * @property {string} kreyol - The requested kreyol
   * @property {string} request - The request
   * @property {SpellcheckMessage} response - The result of the spellcheck
   */

  /**
   *
   * @param {string} kreyol 'GP' or 'MQ', wiche language to use
   * @param {string} request The text to spellchek
   * @returns {ZakariResponse} The spellchek attemp payload
   */
  spellcheck(kreyol, request) {
    const me = this
    return new Promise((resolve, reject) => {
      return axios
        .post(
          `${me.host}/api/spellcheck`,
          {
            kreyol,
            request,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: me._authorization,
              Cookie: me._cookies.join('; '),
            },
            withCredentials: true,
          }
        )
        .then(
          (result) => {
            const rep = result.data
            resolve(rep)
          },
          (reason) => {
            const data = reason.response.data
            data.code = reason.response.status
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }
}

const zakariClient = (host) => {
  const rep = new ZakariClient(host)
  var source = JSON.parse(localStorage.getItem('zakariClient'))
  if (source) {
    rep.host = source.host
    rep.user = source.user
    rep._onUserChange = null
    rep._cookies = source._cookies
    rep._authorization = source._authorization

    // console.log('old zakariClient', rep)
  }

  return rep
}

module.exports = zakariClient
