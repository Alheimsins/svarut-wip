const Ajv = require('ajv')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const forsendelseSchema = require('./schemas/forsendelse.json')

const SVARUT_API_URL_PATH = '/tjenester/api/forsendelse/v1/'

const ajv = new Ajv()
let svarutInstance

const sendForsendelse = async forsendelse => {
  const valid = ajv.validate(forsendelseSchema, forsendelse)

  if (!valid) {
    console.error(ajv.errors)
    throw Error('Schema validation failed')
  }

  try {
    // Ny forsendelse. Returns id
    const { data: { id } } = await svarutInstance.post(SVARUT_API_URL_PATH + 'startNyForsendelse')

    if (!id) throw Error('Could not get id from response')

    // Removes 'data' or 'filePath' from dokumenter
    const payload = {
      ...forsendelse,
      dokumenter: forsendelse.dokumenter.map(({ filePath, data, ...rest }) => ({ ...rest }))
    }

    const form = new FormData()
    form.append('forsendelse', JSON.stringify(payload))

    // Adds files
    forsendelse.dokumenter
      .filter(({ filePath }) => filePath)
      .forEach(document => {
        if (fs.existsSync(document.filePath)) {
          form.append('filer', fs.createReadStream(document.filePath), { knownLength: fs.statSync(document.filePath).size })
        } else {
          throw Error(`File ${document.filePath} does not exist`)
        }
      })

    // TODO: Add handling of dokumenter.data (base64)

    const { data } = await svarutInstance.post(SVARUT_API_URL_PATH + `${id}/sendForsendelse`,
      form,
      { headers: { ...form.getHeaders(), 'Content-Length': form.getLengthSync() } }
    )
    return data
  } catch (error) {
    if (error.response) console.error(error.response.data)
    throw error
  }
}

module.exports = options => {
  if (!options) {
    throw Error('Missing options')
  }
  if (!options.username) {
    throw Error('Missing options.username')
  }
  if (!options.password) {
    throw Error('Missing options.password')
  }
  if (!options.url) {
    options.url = 'https://test.svarut.ks.no'
  }
  if (!options.urlPath) {
    options.urlPath = '/tjenester/api/forsendelse/v1/'
  }

  svarutInstance = axios.create({
    baseURL: options.url,
    timeout: 5000,
    auth: {
      username: options.username,
      password: options.password
    }
  })

  return {
    // TODO: Add handling of multiple mottakere
    sendForsendelse
  }
}
