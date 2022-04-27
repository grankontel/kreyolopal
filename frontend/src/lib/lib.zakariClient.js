const axios = require('axios').default
var jwt = require('jsonwebtoken')

const zakariClient = (host) => {
  return {
    host: host,
    user: null,
    _onUserChange: null,
    _cookies: [],
    _authorization: '',

    _clean: function () {
      this._cookies = []
      this._authorization = ''
      this._setAuthenticated(null)
    },

    _setAuthenticated: function (_user) {
      this.user = _user
      if (typeof this.onUserChange === 'function') {
        this._onUserChange(_user)
      }
    },

    onUserChange: function (callback) {
      this._onUserChange = callback
    },

    /**
     * Log in to zakari api
     * @param {string} email The user email
     * @param {string} password The user password
     * @returns the logged in user on success, false otherwise
     */
    signIn: function (email, password) {
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
              return reject(reason.response.data)
            }
          )
          .catch((error) => {
            return reject({ status: 'error', error })
          })
      })
    },

    /**
     * Log out of Zakari api
     * @returns
     */
    signOut: function () {
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
              reject(reason.response.data)
            }
          )
          .catch((error) => {
            reject({ status: 'error', error })
          })
      })
    },
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
    spellcheck: function (kreyol, request) {
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
              reject(reason.response.data)
            }
          )
          .catch((error) => {
            reject({ status: 'error', error })
          })
      })
    },
  }
}

module.exports = zakariClient
