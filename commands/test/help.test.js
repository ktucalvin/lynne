'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const message = require('$structures/FakeMessage')
let help = require('../help').execute
const expect = chai.expect
chai.use(require('sinon-chai'))

describe('help', function() {
  let spy
  before(function() { i18n.init() })
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
    expect(spy).to.have.been.calledWith('pick.card.description')
  })

  it('localizes any permissions', function() {
    help(message, ['locale'])
    expect(spy).to.have.been.calledWith('permission.MANAGE_GUILD')
  })

  it('notifies user if command cannot be found', function() {
    help(message, ['nonexistantcommand'])
    expect(spy).to.have.been.calledWith('main.commandNotFound')
  })
})
