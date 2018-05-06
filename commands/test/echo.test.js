'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const sinon = require('sinon')
const message = require('./fake-message')
const echo = require('../echo').execute
const { parse } = require('../../parser')
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
    return expect(spy.returnValues[0]).to.eventually.have.property('content').equal('_ _')
  })

  it('should echo given string', function() {
    const { args } = parse('~echo this given string')
    echo(message, args)
    return expect(spy.returnValues[0]).to.eventually.have.property('content').equal('this given string')
  })

  it('should collapse whitespace to one long', function() {
    const { args } = parse('~echo this     spaced    string')
    echo(message, args)
    return expect(spy.returnValues[0]).to.eventually.have.property('content').equal('this spaced string')
  })

  it('should preserve whitespace in quotes', function() {
    const { args } = parse('~echo this  spaced    string and "quoted   spaced   string"  h')
    echo(message, args)
    return expect(spy.returnValues[0]).to.eventually.have.property('content').equal('this spaced string and quoted   spaced   string h')
  })
})
