const {
  assert,
  checkAuthorizedEndpoint,
  checkUnauthorizedEndpoint,
  timeout,
  validateWebPage,
} = require('.')

// Self-Test
async function main() {
  try {
    await assert('test assert', true, 1234)
    assert('this one should PASS', 1, 1)
    
    await assert('test assert', true, 1234)
    assert('this one should FAIL', 0, 0)
    
    baseURL = 'https://httpstat.us/200'
    await checkAuthorizedEndpoint('/')
    
    baseURL = 'https://httpstat.us/401'
    await checkUnauthorizedEndpoint('/')
    
    const dateBefore = new Date()
    await timeout(1000)
    const dateAfter = new Date()
    assert('timeout should wait', dateAfter>dateBefore, dateAfter-dateBefore)
    
    baseURL = 'https://google.com'
    await validateWebPage('Google', '')
  } catch (error) {
    console.error(error)
  }
}

main()
.then(res=>console.log(res))
.catch(err=>console.error(err))