import axios from 'axios'
import jwtDecode from 'jwt-decode'
import pj from '../package.json'
const userAgent = `zakari-client ${pj.version}`

type LoginResponse = {
  status: string
  data: {
    email: string
    jwt: string
  }
}

/**
 * @typedef {Object} RegisterUser
 * @property {string} email - User email
 * @property {string} password1 - User password
 * @property {string} password2 - Password again, for verification
 * @property {string} firstname - User firstname
 * @property {string} lastname - User lastname
 */
type RegisterUser = {
  email: string
  password1: string
  password2: string
  firstname?: string
  lastname?: string
}

/**
 * @typedef {Object} ProfileObject
 * @property {string} firstname - User firstname
 * @property {string} lastname - User lastname
 */
type ProfileObject = {
  firstname: string
  lastname: string
}

/**
 * @typedef {Object} SpellcheckMessage
 * @property {number} id - The id of the stored result
 * @property {number} status - The status of the result
 * @property {string} kreyol - The kreyol used
 * @property {Array<string>} unknown_words - List of unrecognized words in the request
 * @property {string} message - The spellchecked result
 */
type SpellcheckMessage = {
  id: number
  status: number
  kreyol: string
  unknown_words: Array<string>
  message: string
}

/**
 * @typedef {Object} SpellchekResponse
 * @property {number} user - A user id
 * @property {string} tool - Tool used to query
 * @property {string} service - The service called
 * @property {string} kreyol - The requested kreyol
 * @property {string} request - The request
 * @property {SpellcheckMessage} response - The result of the spellcheck
 */
type SpellchekResponse = {
  user: number
  tool: string
  service: string
  kreyol: string
  request: string
  response: SpellcheckMessage
}

/**
 * @typedef {Object} CorrectionRating
 * @property {number} rating - a rating from 0 to 5
 * @property {string} user_correction - a correction proposed by the user
 * @property {string} user_notes - notes of comment on the rating fron the user
 */
type CorrectionRating = {
  rating: number
  user_correction: string
  user_notes: string
}

interface ZakariToken {
  user: {
    firstname: string
    lastname: string
    email: string
  }
  iat: number
  exp: number
}

type UserChangeCallback = (zakari: Zakari, user: object | null) => void

export class Zakari {
  host: string
  user: object | null
  private onUserChangeCallback: UserChangeCallback | null
  cookies: Map<string, string>
  authorization: string

  constructor(aHost: string) {
    this.host = aHost
    this.user = null
    this.onUserChangeCallback = null

    this.cookies = new Map()
    if (typeof window === 'object') {
      // code is running in a browser environment
      this.setCookieMap(document?.cookie, false)
    }
    this.authorization = this.cookies.get('zakari') ?? ''
    if (this.authorization !== '') {
      var decoded = jwtDecode<ZakariToken>(this.authorization)
      this.setAuthenticated(decoded?.user)
    }
  }

  isLoggedIn(): boolean {
    return this.authorization !== ''
  }

  private setCookieMap(cookieRaw: string, setDoc: boolean = true) {
    this.cookies.clear()

    var cookieList = cookieRaw.split(';')
    cookieList.forEach((ac) => {
      if (setDoc && typeof window === 'object') document.cookie = ac
      var splited = ac.split('=')
      this.cookies.set(splited[0].trim(), decodeURIComponent(splited[1]))
    })
  }

  private handleFailure(reason: any) {
    const data = reason.response.data
    data.code = reason.response.status
    if (data.code === 401) this.clean()
    return data
  }

  private clean() {
    this.cookies.clear()
    this.authorization = ''
    this.setAuthenticated(null)
  }

  private setAuthenticated(pUser: any) {
    this.user = pUser
    this.onUserChangeCallback?.(this, pUser)
  }

  onUserChange(callback: UserChangeCallback) {
    this.onUserChangeCallback = callback
  }

  /**
   * Log into the zakari api
   * @param email The user email
   * @param password The user password
   * @returns
   */
  login(email: string, password: string): Promise<Zakari> {
    return new Promise((resolve, reject) => {
      return axios
        .post<LoginResponse>(
          `${this.host}/api/auth/login`,
          {
            email: email,
            password: password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': userAgent,
            },
          }
        )
        .then(
          (result) => {
            if (result.headers['set-cookie']?.length) {
              this.setCookieMap(
                result.headers['set-cookie']
                  .map((x:string) => x.split(';')[0])
                  .join(';')
              )
            }
            const rep = result.data
            this.authorization = rep.data.jwt
            var decoded = jwtDecode<ZakariToken>(rep.data.jwt)
            if (decoded === undefined) {
              return reject({
                code: 500,
                status: 'error',
                error: 'jwt not decoded',
              })
            } else {
              this.setAuthenticated(decoded?.user)
              return resolve(this)
            }
          },
          (reason) => {
            const data = reason.response.data
            data.code = reason.response.status
            this.clean()
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  signOut() {
    return new Promise((resolve, reject) => {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authorization}`,
        'User-Agent': userAgent,
      }
      return axios
        .post(
          `${this.host}/api/auth/logout`,
          {},
          {
            headers,
            withCredentials: true,
          }
        )
        .then(
          (result) => {
            const rep = result.data
            this.clean()
            resolve(rep)
          },
          (reason) => {
            const data = this.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   *
   * @param {string} kreyol 'GP' or 'MQ', wiche language to use
   * @param {string} request The text to spellchek
   * @returns {SpellchekResponse} The spellchek attemp payload
   */
  spellcheck(kreyol: string, request: string): Promise<SpellchekResponse> {
    return new Promise((resolve, reject) => {
      return axios
        .post(
          `${this.host}/api/spellcheck`,
          {
            kreyol,
            request,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.authorization}`,
              'User-Agent': userAgent,
              // Cookie: this.cookies.join('; '),
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
            const data = this.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * Rate the provided correction
   * @param {string} msgId The id of the correction to rate
   * @param {CorrectionRating} rating the rating info
   */
  rateCorrection(msgId: string, rating: CorrectionRating) {
    const me = this
    const url = `${me.host}/api/account/spellcheck/${msgId}/rating`
    return new Promise((resolve, reject) => {
      return axios
        .post(url, rating, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.authorization}`,
            'User-Agent': userAgent,
            // Cookie: me._cookies.join('; '),
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
   * Gets current user profile
   * @returns ProfileObject
   */
  getProfile(): Promise<ProfileObject> {
    return new Promise((resolve, reject) => {
      return axios
        .get(`${this.host}/api/profile`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.authorization}`,
            'User-Agent': userAgent,
            // Cookie: me._cookies.join('; '),
          },
          withCredentials: true,
        })
        .then(
          (result) => {
            const rep = result.data
            resolve(rep)
          },
          (reason) => {
            const data = this.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * Request a password reset
   * @param {string} email Email to reset password for
   * @returns Promise
   */
  requestResetPwd(email: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return axios
        .post(
          `${this.host}/api/verify/resetpwd`,
          {
            email,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': userAgent,
            },
          }
        )
        .then(
          (result) => {
            const rep = result.data
            resolve(rep)
          },
          (reason) => {
            const data = this.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * Set a new password for user identified by token
   * @param {string} password The new password
   * @param {string} verification Verification for the new password
   * @param {string} token The reset password token
   */
  resetPassword(
    password: string,
    verification: string,
    token: string
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return axios
        .post(
          `${this.host}/api/verify/resetpwdtoken`,
          {
            password,
            verification,
            token,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.authorization}`,
              'User-Agent': userAgent,
              // Cookie: me._cookies.join('; '),
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
            const data = this.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * Get the user associated to a reset password token (sent by email)
   * @param {string} token The reset password token
   * @returns user info associated with token if any
   */
  userByToken(token: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return axios
        .get(
          `${this.host}/api/verify/bytoken/${token}`,

          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': userAgent,
            },
          }
        )
        .then(
          (result) => {
            const rep = result.data
            resolve(rep)
          },
          (reason) => {
            const data = this.handleFailure(reason)
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
  setProfile(profile: ProfileObject): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return axios
        .post(`${this.host}/api/profile`, profile, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.authorization}`,
            'User-Agent': userAgent,
            // Cookie: me._cookies.join('; '),
          },
          withCredentials: true,
        })
        .then(
          (result) => {
            const rep = result.data
            resolve(rep)
          },
          (reason) => {
            const data = this.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * Change the current user's password
   * @param currentPassword The current user password
   * @param newPassword The new password to set
   * @param verification Should be the same as the new password
   * @returns ok on sucess
   */
  updatePassword(
    currentPassword: string,
    newPassword: string,
    verification: string
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      return axios
        .post(
          `${this.host}/api/profile/updatepwd`,
          {
            currentPassword,
            newPassword,
            verification,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.authorization}`,
              'User-Agent': userAgent,
              // Cookie: me._cookies.join('; '),
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
            const data = this.handleFailure(reason)
            return reject(data)
          }
        )
        .catch((error) => {
          return reject({ code: 500, status: 'error', error })
        })
    })
  }

  /**
   * Register a new user
   * @param newuser The user to register
   * @returns ok on success
   */
  register(newuser: RegisterUser) {
    return new Promise((resolve, reject) => {
      return axios
        .post(`${this.host}/api/auth/register`, newuser, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
          },
        })
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
