'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const sinon = require('sinon')
const i18n = require('../../i18n')
const message = require('./fake-message')
const pick = require('../pick').execute
let spy

describe('pick', function() {
  before(function() { i18n.init('en_US') })
  beforeEach(function() {
    spy = sinon.spy(message.channel, 'send')
  })

  afterEach(function() {
    spy.restore()
  })

  it('should notify user if less than two arguments provided', function() {
    pick(message, [])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').include('at least two')
  })

  it('should pick from a range of given options', function() {
    pick(message, ['a', 'a'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').equal('I choose a')
  })

  it('should pick from a numeric range if passed -r', function() {
    pick(message, ['-r', '--', '-100', '100'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').satisfy(str => {
      let num = str.slice('I choose '.length)
      return num > -100 && num < 100
    })
  })

  it('should automatically swap numeric bounds if given out of order', function() {
    pick(message, ['-r', '--', '100', '-100'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').satisfy(str => {
      let num = str.slice('I choose '.length)
      return num > -100 && num < 100
    })
  })

  it('should pick a card if passed -c', function() {
    pick(message, ['-c'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').include('I got')
  })

  it('should reject non-numeric input for ranged pick', function() {
    pick(message, ['-r', '1', 'A'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').include('not an integer')
  })
})
