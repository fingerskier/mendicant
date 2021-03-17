const mendicant = require('.')('mendicant')

const {
  assert,
  checkAuthorizedEndpoint,
  checkUnauthorizedEndpoint,
  get,
  getBaseURL,
  setBaseURL,
  timeout,
  validateWebPage,
} = mendicant


// Self-Test
async function main() {
  try {
    await assert('test assert', true, 1234)
    assert('this one should PASS', 1, 1)

    await assert('test assert', true, 1234)
    assert('this one should FAIL', 0, 0)

    const priorBase = getBaseURL()
    const newBase = 'http://localhost:7777'
    setBaseURL(newBase)
    const postBase = getBaseURL()
    const goodBaseChange = ((priorBase!==postBase) && (postBase===newBase))
    assert('get/set base-url', goodBaseChange, newBase, postBase)

    setBaseURL('https://httpstat.us/200')
    await checkAuthorizedEndpoint('/')

    setBaseURL('https://httpstat.us/401')
    await checkUnauthorizedEndpoint('/')

    const dateBefore = new Date()
    await timeout(1000)
    const dateAfter = new Date()
    assert('timeout should wait', dateAfter>dateBefore, dateAfter-dateBefore)

    setBaseURL('https://google.com')
    await validateWebPage('Google', '')

    await validateWebPage('Awesome search', 'search', {q:'awesomeness'})
  } catch (error) {
    console.error(error)
  }
}

main()
.then(res=>console.log(res))
.catch(err=>console.error(err))