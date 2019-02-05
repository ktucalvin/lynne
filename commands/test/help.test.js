'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const registry = require('$lib/registry')
const Message = require('$structures/FakeMessage')
const help = require('../help').execute
const expect = chai.expect

describe('help', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })
  after(function () { registry.purge() })

  it('prints a list of commands given no arguments', function () {
    help(message, [])
    expect(spy).to.have.been.calledWith('help.getDetailedInformation')
  })

  it('prints a detailed description of a command if given argument', function () {
    help(message, ['ping'])
    expect(spy).to.have.been.calledWith('help.property.description')
  })

  it('generates description of options if optmap available', function () {
    help(message, ['pick'])
    expect(spy).to.have.been.calledWith('pick.card.description')
  })

  it('localizes any permissions', function () {
    help(message, ['locale'])
    expect(spy).to.have.been.calledWith('permission.MANAGE_GUILD')
  })

  it('notifies user if command cannot be found', function () {
    help(message, ['nonexistantcommand'])
    expect(spy).to.have.been.calledWith('main.commandNotFound')
  })

  it('prints a command\'s alias if it has one', function () {
    help(message, ['devreload'])
    expect(spy).to.have.been.calledWith('help.property.aliases')
  })

  it('prints a command\'s required role if it has one', function () {
    help(message, ['add'])
    expect(spy).to.have.been.calledWith('help.property.role')
  })
})
