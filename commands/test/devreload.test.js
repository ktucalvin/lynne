'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const registry = require('$lib/registry')
const Message = require('$structures/FakeMessage')
const devreload = require('../devreload').execute
const expect = chai.expect
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

describe('devreload', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    spy = sinon.spy(registry, 'reload')
  })
  afterEach(function () { spy.restore() })

  it('reloads the registry', function () {
    devreload(message, [])
    expect(spy).to.be.called()
  })

  it('caches the registry module', function () {
    const logSpy = sinon.spy(console, 'log')
    delete require.cache[require.resolve('$lib/registry')]
    devreload(message, [])
    expect(logSpy).to.be.calledWith(sinon.match(/\[Registry\]*/))
  })
})
