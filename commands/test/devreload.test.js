'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const registry = require('$lib/registry')
const Message = require('$structures/FakeMessage')
const devreload = require('../devreload').execute
const expect = chai.expect

describe('devreload', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    spy = sinon.spy(registry, 'reload')
  })
  afterEach(function () { spy.restore() })

  it('reloads the registry', function () {
    devreload(message, [])
    devreload(message, [])
    expect(spy).to.be.calledTwice()
  })
})
