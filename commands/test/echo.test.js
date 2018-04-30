'use strict'
/* eslint-env mocha */
const expect = require('chai').expect
const sinon = require('sinon')
const message = require('./fake-message')
const echo = require('../echo.js').execute
const parse = require('../../parser.js')
let spy
describe('echo', function() {
  beforeEach(function() {
    spy = sinon.spy(message.channel, 'send')
  })

  afterEach(function() {
    spy.restore()
  })

  it('should echo a blank line given nothing to echo', function() {
    echo(message, [])
    expect(spy.returnValues[0]).to.equal('_ _')
  })

  it('should echo given string', function() {
    const { args } = parse('~echo this given string')
    echo(message, args)
    expect(spy.returnValues[0]).to.equal('this given string')
  })

  it('should collapse whitespace to one long', function() {
    const { args } = parse('~echo this     spaced    string')
    echo(message, args)
    expect(spy.returnValues[0]).to.equal('this spaced string')
  })

  it('should preserve whitespace in quotes', function() {
    const { args } = parse('~echo this  spaced    string and "quoted   spaced   string"  h')
    echo(message, args)
    expect(spy.returnValues[0]).to.equal('this spaced string and quoted   spaced   string h')
  })
})
