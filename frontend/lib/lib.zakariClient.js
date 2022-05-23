const axios = require('axios').default
var jwt = require('jsonwebtoken')

function bindMethods() {
  Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((key) => {
    if (this[key] instanceof Function && key !== 'constructor')
      this[key] = this[key].bind(this)
  })
}

/**
 * @typedef {Object} ZakariResponse
 * @property {string} status - User firstname
 * @property {object} [data] - The data if the request succeeded
 * @property {object} [error] - Errors if the request failed
 */

class ZakariClient {
  constructor(host) {
    this.host = host
    this.user = null
    this._onUserChange = null
    this._cookies = []
    this._authorization = ''

    bindMethods.call(this)
  }

  handleFailure(reason) {
    const data = reason.response.data
    data.code = reason.response.status
    if (data.code === 401) this._clean()
    return data
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
            me._clean()
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
   * @property {number} id - The id of the stored result
   * @property {number} status - The status of the result
   * @property {string} kreyol - The kreyol used
   * @property {Array<string>} unknown_words - List of unrecognized words in the request
   * @property {string} message - The spellchecked result
   */

  /**
   * @typedef {Object} SpellchekResponse
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
   * @returns {SpellchekResponse} The spellchek attemp payload
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
            const data = me.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * @typedef {Object} CorrectionRating
   * @property {number} rating - a rating from 0 to 5
   * @property {string} user_correction - a correction proposed by the user
   * @property {string} user_notes - notes of comment on the rating fron the user
   */

  /**
   * Rate the provided correction
   * @param {string} msgId The id of the correction to rate
   * @param {CorrectionRating} rating the rating info
   */
  rateCorrection(msgId, rating) {
    const me = this
    const url = `${me.host}/api/account/spellcheck/${msgId}/rating`
    return new Promise((resolve, reject) => {
      return axios
        .post(url, rating, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: me._authorization,
            Cookie: me._cookies.join('; '),
          },
          withCredentials: true,
        })
        .then(
          (result) => {
            const rep = result.data
            resolve(rep)
          },
          (reason) => {
            const data = me.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * @typedef {Object} ProfileObject
   * @property {string} firstname - User firstname
   * @property {string} lastname - User lastname
   */

  /**
   * Gets current user profile
   * @returns ProfileObject
   */
  getProfile() {
    const me = this
    return new Promise((resolve, reject) => {
      return axios
        .get(
          `${me.host}/api/profile`,
          {},
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
            const data = me.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * Update the current user profile
   * @param {ProfileObject} profile the profile data to update
   * @returns ZakariResponse
   */
  setProfile(profile) {
    const me = this
    return new Promise((resolve, reject) => {
      return axios
        .post(`${me.host}/api/profile`, profile, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: me._authorization,
            Cookie: me._cookies.join('; '),
          },
          withCredentials: true,
        })
        .then(
          (result) => {
            const rep = result.data
            resolve(rep)
          },
          (reason) => {
            const data = me.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  register(newuser) {
    const me = this
    return new Promise((resolve, reject) => {
      return axios
        .post(`${me.host}/api/auth/register`, newuser)
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

export default zakariClient
