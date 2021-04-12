export default function(namespace){
  const fetchOptions = {
    credentials: 'include',
    mode: 'no-cors',
  }
  let baseURL = 'http://amazon.com'

  const randInt = max=>Math.floor(Math.random() * Math.floor(max))
  const url = fragment=>`${baseURL}/${fragment}`

  function assert(url, success, before='', after='') {
    if (success) {
      console.log(`PASS: ${namespace}:`, url, before, after)
    } else {
      console.log(`FAIL: ${namespace}:`, url, before, after)
    }
  }

  async function checkAuthorizedEndpoint(url_fragment, payload) {
    let res
    try {
      await post('login', payload)
      res = await get(url_fragment)
      const status = httpStatusCode(res)

      httpAssert(`authorized @ ${url_fragment}`, status===200, 'Response: '+status)
    } catch (error) {
      console.error('choked on', url_fragment, res)
    }
  }

  async function checkUnauthorizedEndpoint(url_fragment, payload) {
    let res
    try {
      await get('logout', payload)
      res = await get(url_fragment)
      const status = httpStatusCode(res)
      assert(`${url_fragment} should have been unauthorized`, status)
    } catch (error) {
      const status = httpStatusCode(res)

      httpAssert(`unauthorized @ ${url_fragment}`, status===401, 'Response: '+status)
    }
  }

  async function get(fragment, query) {
    try {
      let queryString = ''

      if (query) {
        queryString = '?'
        for (let key in query) {
          queryString += `${key}=${query[key]}`
        }
      }

      const fullUrl = url(fragment) + queryString

      const result = await fetch(fullUrl, {
        ...fetchOptions,
        method: 'GET',
      })
      return result.data
    } catch (error) {
      console.error('get error', fragment, query)
    }
  }
  
  function httpStatusCode(res) {
    let status = -7
    if (res) {
      const response = res.response || {status: -7}
      status = res.code || response.status
    }

    return status
  }

  function httpAssert(url, success, before='', after='') {
    if (success) {
      console.log('PASS:', url, before, after)
    } else {
      console.log('FAIL:', url, before, after)
    }
  }

  async function post(fragment, payload) {
    try {
      const result = await fetch(url(fragment), {
        ...fetchOptions,
        body: JSON.stringify(payload),
        method: 'POST',
      })
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

  // async function validateWebPage(name, url_fragment, payload) {
  //   const validator = require('html-validator')

  //   const page = await get(url_fragment, payload)
  //   const validation = JSON.parse(await validator({data: page}))

  //   const numErrors = validation.messages.filter(X=>X.type==='error').length
  //   const errorMessages = validation.messages.map(X=>X.message)

  //   const goodPage = validation.messages && validation.messages.length
  //   httpAssert(`validating @ ${name}`, goodPage, `Errors: ${numErrors}\n`)//, errorMessages.join('\n'))
  // }


  return {
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
    // validateWebPage: validateWebPage,
  }
}