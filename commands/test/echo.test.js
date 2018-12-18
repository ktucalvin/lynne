'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const message = require('$structures/FakeMessage')
const echo = require('../echo').execute
const expect = chai.expect
chai.use(require('sinon-chai'))

describe('echo', function () {
  let spy
  beforeEach(function () { spy = sinon.spy(message.channel, 'send') })
  afterEach(function () { spy.restore() })

  it('echoes blank line given no args', function () {
    echo(message, [])
    expect(spy).to.be.calledWith('_ _')
  })

  it('echoes a given string', function () {
    echo(message, ['a', 'given', 'string'])
    expect(spy).to.be.calledWith('a given string')
  })

  it('preserves whitespace', function () {
    echo(message, ['s p a c e d', ' string '])
    expect(spy).to.be.calledWith('s p a c e d  string ')
  })
})
