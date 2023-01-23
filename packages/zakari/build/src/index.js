"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zakari = void 0;
const axios_1 = __importDefault(require("axios"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const package_json_1 = __importDefault(require("../package.json"));
const userAgent = `zakari-client ${package_json_1.default.version}`;
class Zakari {
    constructor(aHost) {
        var _a;
        this.host = aHost;
        this.user = null;
        this.onUserChangeCallback = null;
        this.cookies = new Map();
        if (typeof window === 'object') {
            // code is running in a browser environment
            this.setCookieMap(document === null || document === void 0 ? void 0 : document.cookie, false);
        }
        this.authorization = (_a = this.cookies.get('zakari')) !== null && _a !== void 0 ? _a : '';
        if (this.authorization !== '') {
            var decoded = (0, jwt_decode_1.default)(this.authorization);
            this.setAuthenticated(decoded === null || decoded === void 0 ? void 0 : decoded.user);
        }
    }
    isLoggedIn() {
        return this.authorization !== '';
    }
    setCookieMap(cookieRaw, setDoc = true) {
        this.cookies.clear();
        var cookieList = cookieRaw.split(';');
        cookieList.forEach((ac) => {
            if (setDoc && typeof window === 'object')
                document.cookie = ac;
            var splited = ac.split('=');
            this.cookies.set(splited[0].trim(), decodeURIComponent(splited[1]));
        });
    }
    handleFailure(reason) {
        const data = reason.response.data;
        data.code = reason.response.status;
        if (data.code === 401)
            this.clean();
        return data;
    }
    clean() {
        this.cookies.clear();
        this.authorization = '';
        this.setAuthenticated(null);
    }
    setAuthenticated(pUser) {
        var _a;
        this.user = pUser;
        (_a = this.onUserChangeCallback) === null || _a === void 0 ? void 0 : _a.call(this, this, pUser);
    }
    onUserChange(callback) {
        this.onUserChangeCallback = callback;
    }
    /**
     * Log into the zakari api
     * @param email The user email
     * @param password The user password
     * @returns
     */
    login(email, password) {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .post(`${this.host}/api/auth/login`, {
                email: email,
                password: password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': userAgent,
                },
            })
                .then((result) => {
                var _a;
                if ((_a = result.headers['set-cookie']) === null || _a === void 0 ? void 0 : _a.length) {
                    this.setCookieMap(result.headers['set-cookie']
                        .map((x) => x.split(';')[0])
                        .join(';'));
                }
                const rep = result.data;
                this.authorization = rep.data.jwt;
                var decoded = (0, jwt_decode_1.default)(rep.data.jwt);
                if (decoded === undefined) {
                    return reject({
                        code: 500,
                        status: 'error',
                        error: 'jwt not decoded',
                    });
                }
                else {
                    this.setAuthenticated(decoded === null || decoded === void 0 ? void 0 : decoded.user);
                    return resolve(this);
                }
            }, (reason) => {
                const data = reason.response.data;
                data.code = reason.response.status;
                this.clean();
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    signOut() {
        return new Promise((resolve, reject) => {
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.authorization}`,
                'User-Agent': userAgent,
            };
            return axios_1.default
                .post(`${this.host}/api/auth/logout`, {}, {
                headers,
                withCredentials: true,
            })
                .then((result) => {
                const rep = result.data;
                this.clean();
                resolve(rep);
            }, (reason) => {
                const data = this.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     *
     * @param {string} kreyol 'GP' or 'MQ', wiche language to use
     * @param {string} request The text to spellchek
     * @returns {SpellchekResponse} The spellchek attemp payload
     */
    spellcheck(kreyol, request) {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .post(`${this.host}/api/spellcheck`, {
                kreyol,
                request,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.authorization}`,
                    'User-Agent': userAgent,
                    // Cookie: this.cookies.join('; '),
                },
                withCredentials: true,
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = this.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     * Rate the provided correction
     * @param {string} msgId The id of the correction to rate
     * @param {CorrectionRating} rating the rating info
     */
    rateCorrection(msgId, rating) {
        const me = this;
        const url = `${me.host}/api/account/spellcheck/${msgId}/rating`;
        return new Promise((resolve, reject) => {
            return axios_1.default
                .post(url, rating, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.authorization}`,
                    'User-Agent': userAgent,
                    // Cookie: me._cookies.join('; '),
                },
                withCredentials: true,
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = me.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     * Gets current user profile
     * @returns ProfileObject
     */
    getProfile() {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .get(`${this.host}/api/profile`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.authorization}`,
                    'User-Agent': userAgent,
                    // Cookie: me._cookies.join('; '),
                },
                withCredentials: true,
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = this.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     * Request a password reset
     * @param {string} email Email to reset password for
     * @returns Promise
     */
    requestResetPwd(email) {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .post(`${this.host}/api/verify/resetpwd`, {
                email,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': userAgent,
                },
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = this.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     * Set a new password for user identified by token
     * @param {string} password The new password
     * @param {string} verification Verification for the new password
     * @param {string} token The reset password token
     */
    resetPassword(password, verification, token) {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .post(`${this.host}/api/verify/resetpwdtoken`, {
                password,
                verification,
                token,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.authorization}`,
                    'User-Agent': userAgent,
                    // Cookie: me._cookies.join('; '),
                },
                withCredentials: true,
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = this.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     * Get the user associated to a reset password token (sent by email)
     * @param {string} token The reset password token
     * @returns user info associated with token if any
     */
    userByToken(token) {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .get(`${this.host}/api/verify/bytoken/${token}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': userAgent,
                },
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = this.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     * Update the current user profile
     * @param {ProfileObject} profile the profile data to update
     * @returns ZakariResponse
     */
    setProfile(profile) {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .post(`${this.host}/api/profile`, profile, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.authorization}`,
                    'User-Agent': userAgent,
                    // Cookie: me._cookies.join('; '),
                },
                withCredentials: true,
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = this.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     * Change the current user's password
     * @param currentPassword The current user password
     * @param newPassword The new password to set
     * @param verification Should be the same as the new password
     * @returns ok on sucess
     */
    updatePassword(currentPassword, newPassword, verification) {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .post(`${this.host}/api/profile/updatepwd`, {
                currentPassword,
                newPassword,
                verification,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.authorization}`,
                    'User-Agent': userAgent,
                    // Cookie: me._cookies.join('; '),
                },
                withCredentials: true,
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = this.handleFailure(reason);
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
    /**
     * Register a new user
     * @param newuser The user to register
     * @returns ok on success
     */
    register(newuser) {
        return new Promise((resolve, reject) => {
            return axios_1.default
                .post(`${this.host}/api/auth/register`, newuser, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': userAgent,
                },
            })
                .then((result) => {
                const rep = result.data;
                resolve(rep);
            }, (reason) => {
                const data = reason.response.data;
                data.code = reason.response.status;
                return reject(data);
            })
                .catch((error) => {
                return reject({ code: 500, status: 'error', error });
            });
        });
    }
}
exports.Zakari = Zakari;
