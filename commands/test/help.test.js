'use strict'
/* eslint-env mocha */
const expect = require('chai').expect
const sinon = require('sinon')
const message = require('./fake-message')
const help = require('../help.js').execute
let spy
describe('echo', function() {
  beforeEach(function() {
    spy = sinon.spy(message.channel, 'send')
  })

  afterEach(function() {
    spy.restore()
  })

  it('should print a list of commands given no arguments', function() {
    help(message, [])
    const result = spy.returnValues[0]
    expect(result.description).to.include('\nping')
    expect(result.description).to.not.include('Name:')
  })

  it('should print a detailed description of a command if given argument', function() {
    help(message, ['ping'])
    const result = spy.returnValues[0]
    expect(result.description).to.include('**Name**:')
    expect(result.description).to.not.include('echo')
  })

  it('should notify user if command cannot be found', function() {
    help(message, ['nonexistantcommand'])
    expect(spy.returnValues[0]).to.equal('That\'s not a command that I know yet..')
  })
})
