/* eslint-disable no-console */
const authService = require('../server/services/authService')

const plain = process.argv[process.argv.length - 1]

console.log(plain)
;(async () => {
  const pwd = await authService.hashPassword(plain)
  console.log(pwd)
})()
