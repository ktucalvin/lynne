'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const sinon = require('sinon')
const message = require('./fake-message')
const ping = require('../ping').execute
let spy
describe('ping', function() {
  beforeEach(function() {
    spy = sinon.spy(message.channel, 'send')
  })

  afterEach(function() {
    spy.restore()
  })

  it('should send "pong!" to the channel', function() {
    ping(message, [])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').equals('pong!')
  })
})
