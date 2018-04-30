'use strict'
/* eslint-env mocha */
const expect = require('chai').expect
const sinon = require('sinon')
const message = require('./fake-message')
const ping = require('../ping.js').execute
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
    expect(spy.returnValues[0]).to.equal('pong!')
  })
})
