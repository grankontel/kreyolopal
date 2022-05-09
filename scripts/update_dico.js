/* eslint-disable no-console */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')

const readFile = promisify(fs.readFile)
const config = require('../server/config')

const s3Options = {
  credentials: {
    accessKeyId: config.aws.keyId,
    secretAccessKey: config.aws.keySecret,
  },
  region: config.aws.region,
}

// eslint-disable-next-line no-unused-vars
async function readDicoFiles(kreyol) {
  const readAff = readFile(
    path.resolve(__dirname, '../server/dico/cpf_GP.aff'),
    'utf8'
  )
  const readDic = readFile(
    path.resolve(__dirname, '../server/dico/cpf_GP.dic'),
    'utf8'
  )

  const affix = Buffer.from(await readAff)
  const dictionary = Buffer.from(await readDic)

  return { affix, dictionary }
}

const client = new S3Client(s3Options)
// https://kreyol-dico.s3.amazonaws.com/dico/cpf_GP.aff

const createPutCommand = (file, content) => {
  return new Promise((reject, resolve) => {
    let data = ''
    try {
      data = content.toString('utf-8')
    } catch (e) {
      console.log(e)
      reject(e)
      return
    }

    const putCommand = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: file,
      Body: data,
      ContentType: 'text/plain',
    })

    client
      .send(putCommand)
      .then(
        (rep) => {
          resolve(rep)
          console.log(`${file} : done`)
        },
        (reason) => {
          reject(reason)
          console.log(`${file} : error`)
        }
      )
      .catch((exc) => {
        console.log(exc)
        console.log('exception')
        reject(exc)
      })
  })
}

readDicoFiles('GP')
  .then(
    (result) => {
      const { affix, dictionary } = result
      // console.log(dictionary.toString('utf-8'))
      const putAffix = createPutCommand('dico/cpf_GP.aff', affix)
      const putDico = createPutCommand('dico/cpf_GP.dic', dictionary)

      // return putDico
      return Promise.all([putAffix, putDico])
    },
    (reason) => console.log(reason)
  )
  .catch((ex) => {
    console.log(ex)
  })
