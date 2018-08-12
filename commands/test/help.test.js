'use strict'
/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('../../i18n')
const message = require('./fake-message')
let help
const expect = chai.expect
chai.use(require('sinon-chai'))

describe('help', function() {
  let spy
  before(function() {
    i18n.init()
    help = require('../help').execute
  })
  beforeEach(function() { spy = sinon.spy(i18n, 'translate') })
  afterEach(function() { spy.restore() })

  it('prints a list of commands given no arguments', function() {
    help(message, [])
    expect(spy).to.have.been.calledWith('help.getDetailedInformation')
  })

  it('prints a detailed description of a command if given argument', function() {
    help(message, ['ping'])
    expect(spy).to.have.been.calledWith('help.property.description')
  })

  it('generates description of options if optmap available', function() {
    help(message, ['pick'])
    expect(spy).to.have.been.calledWith('pick.opt.card.description')
  })

  it('notifies user if command cannot be found', function() {
    help(message, ['nonexistantcommand'])
    expect(spy).to.have.been.calledWith('main.commandNotFound')
  })
})
