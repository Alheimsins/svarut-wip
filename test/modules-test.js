const test = require('ava')

test('requires options', t => {
  const config = false
  const error = t.throws(() => {
    const svarut = require('../src/index')(config)
    console.log(svarut)
  }, TypeError)
  t.is(error.message, 'Missing options')
})
