'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const sinon = require('sinon')
const i18n = require('../../i18n')
const message = require('./fake-message')
const help = require('../help').execute
let spy

describe('help', function() {
  before(function() { i18n.init('en_US') })
  beforeEach(function() {
    spy = sinon.spy(message.channel, 'send')
  })

  afterEach(function() {
    spy.restore()
  })

  it('should print a list of commands given no arguments', function() {
    help(message, [])
    return expect(spy.returnValues[0]).to.eventually.have.nested.property('content.description').include('\nping')
  })

  it('should print a detailed description of a command if given argument', function() {
    help(message, ['ping'])
    return expect(spy.returnValues[0]).to.eventually
      .have.nested.property('content.fields[0]')
      .have.property('name').equal('Description')
  })

  it('should generate description of options if optmap available', function() {
    help(message, ['pick'])
    return expect(spy.returnValues[0]).to.eventually
      .have.nested.property('content.fields[0].value')
      .to.include('-c --card')
  })

  it('should notify user if command cannot be found', function() {
    help(message, ['nonexistantcommand'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').include('not a command')
  })
})
