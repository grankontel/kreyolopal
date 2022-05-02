const mailer = require('./lib.mailer')
const logger = require('./logger')
const mustache = require('mustache')
const mjml = require('mjml')
const { htmlToText } = require('html-to-text')
const config = require('../config')

const NodeCache = require('node-cache')
const myCache = new NodeCache()

const path = require('path')
const fs = require('fs/promises')

/**
 * Get the content of the template
 * @param {string} templateFilename The template file name
 * @returns contents of the template
 */
const getTemplate =  (templateFilename) => {
  const name = templateFilename.toLowerCase()
  const _file = path.join(__dirname, "../mails/", templateFilename);

  return new Promise(async (resolve, reject) => {
    let value = myCache.get(name)
    if (value === undefined) {
        value = await fs.readFile(_file, 'utf-8')
        myCache.set(name, value)
    }
    
    resolve(value)
  })
}

/**
 * Create an email
 * @param {string} templateFilename - The mjml template file
 * @param {string} templateData - The mjml template data
 * @returns {Promise} a Promise to create the email
 */
const makeEmail = (templateFilename, templateData) => {
  return new Promise(function (resolve, reject) {
    return getTemplate(templateFilename).then(mjmlTemplate => {
        if (!mjmlTemplate) reject(`No such template ${templateFilename}`)

        const renderedMjml = mustache.render(mjmlTemplate, templateData)
    
        const html = mjml(renderedMjml).html
        const text = htmlToText(html, { wordwrap: 130 })
    
        resolve({ html, text })
    })

  })
}

/**
 *
 * @param {string} templateFilename The MJML templatefile
 * @param {string} templateData The MJML template data
 * @param {string} recipient Recipient of the email
 * @param {string} subject The subject of the email
 * @returns {Promise} a Promise to send the email
 */
const sendEmail = (templateFilename, templateData, recipient, subject) => {
  return new Promise(function (resolve, reject) {
    return makeEmail(templateFilename, templateData)
    .then((email) => {
      mailer.sendMail(
        {
          from: config.mail.from,
          to: recipient, //_saveduser.email,
          subject: subject,
          text: email.text,
          html: email.html,
        },
        (err, info) => {
          if (err) {
            reject(err)
          } else {
            resolve(info)
          }
        }
      )
    })
  })
}

module.exports=sendEmail