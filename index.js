require('dotenv').config()
const axios = require('axios')
axios.defaults.withCredentials = true

let baseURL = process.env.MENDICANT_BASE_URL || 'http://amazon.com'
require('colors')
const https = require('https')
const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
})
const validator = require('html-validator')

const randInt = max=>Math.floor(Math.random() * Math.floor(max))
const url = fragment=>`${baseURL}/${fragment}`


function assert(url, success, before='', after='') {
  if (success) {
    console.log('PASS:'.brightGreen, url, before, after)
  } else {
    console.log('FAIL:'.inverse.brightRed, url, before, after)
  }
}

async function checkAuthorizedEndpoint(url_fragment, credentials) {
  let res
  try {
    await post('login', credentials)
    res = await get(url_fragment)
    const status = httpStatusCode(res)

    httpAssert(`authorized @ ${url_fragment}`, status===200, 'Response: '+status)
  } catch (error) {
    console.error('choked on', url_fragment, res)
    // console.error(error)
  }
}

async function checkUnauthorizedEndpoint(url_fragment) {
  let res
  try {
    await get('logout')
    res = await get(url_fragment)
    const status = httpStatusCode(res)
    assert(`${url_fragment} should have been unauthorized`, status)
  } catch (error) {
    const status = httpStatusCode(res)

    httpAssert(`unauthorized @ ${url_fragment}`, status===401, 'Response: '+status)
  }
}

function errorHandler(where, err) {
  console.error('ERROR'.inverse.brightRed, where, err)
}

async function get(fragment, payload) {
  try {
    const fullUrl = url(fragment)
    const result = await instance.get(fullUrl, payload)
    return result.data
  } catch (error) {
    console.error('get error', fragment, payload)
  }
}

function httpStatusCode(res) {
  let status = -7
  if (res) {
    console.log(res)
    const response = res.response || {status: -7}
    status = res.code || response.status
  }

  return status
}

function httpAssert(url, success, before='', after='') {
  if (success) {
    console.log('PASS:'.brightGreen, url, before, after)
  } else {
    console.log('FAIL:'.inverse.brightRed, url, before, after)
  }
}

async function post(fragment, payload) {
  try {
    const result = await instance.post(url(fragment), payload)
    return result.data
  } catch (error) {
    console.error('post error', fragment)
  }
}

function getBaseURL() {
  return baseURL
}
function setBaseURL(newURL) {
  baseURL = newURL
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function validateWebPage(name, url_fragment, payload) {
  const page = await get(url_fragment, payload)
  const validation = JSON.parse(await validator({data: page}))

  const numErrors = validation.messages.filter(X=>X.type==='error').length
  const errorMessages = validation.messages.map(X=>X.message)

  const goodPage = validation.messages && validation.messages.length
  httpAssert(`validating @ ${name}`, goodPage, `Errors: ${numErrors}\n`)//, errorMessages.join('\n'))
}


module.exports = {
  assert: assert,
  checkAuthorizedEndpoint: checkAuthorizedEndpoint,
  checkUnauthorizedEndpoint: checkUnauthorizedEndpoint,
  get: get,
  getBaseURL: getBaseURL,
  httpAssert: httpAssert,
  post: post,
  setBaseURL: setBaseURL,
  timeout: timeout,
  randInt: randInt,
  validateWebPage: validateWebPage,
}