'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const message = require('$structures/FakeMessage')
const ping = require('../ping').execute
const expect = chai.expect
chai.use(require('sinon-chai'))

describe('ping', function() {
  let spy
  before(function() { spy = sinon.spy(message.channel, 'send') })
  after(function() { spy.restore() })

  it('sends "pong!"', function() {
    ping(message, [])
    expect(spy).to.be.calledWith('pong!')
  })
})
