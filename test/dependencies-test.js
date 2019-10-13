const test = require('ava')
const pkg = require('../package.json')
const dependencies = pkg.dependencies || false
const devDependencies = pkg.devDependencies || false

test('basic check', t => {
  t.true(true, 'ava works ok')
})

if (dependencies) {
  Object.keys(dependencies).forEach(dependency =>
    test(`${dependency} loads ok`, t => t.truthy(require(dependency)))
  )
}

if (devDependencies) {
  Object.keys(devDependencies)
    .forEach(dependency =>
      test(`${dependency} loads ok`, t => t.truthy(require(dependency)))
    )
}
