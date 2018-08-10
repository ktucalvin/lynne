'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const sinon = require('sinon')
const i18n = require('../../i18n')
const message = require('./fake-message')
let locale
let spy

describe('locale', function() {
  before(function() {
    i18n.init()
    i18n.setServerLocale('localeTest', 'en_US')
    locale = require('../locale').execute
  })

  beforeEach(function() {
    message.guild.id = 'localeTest'
    message.member.permissions.set('MANAGE_GUILD')
    spy = sinon.spy(message.channel, 'send')
  })

  afterEach(function() {
    spy.restore()
  })

  after(function() { message.guild.id = '0000' })

  it('should require a subcommand specified', function() {
    locale(message, [])
    return expect(spy.returnValues[0]).to.eventually.have.nested.property('content').include('No subcommand')
  })

  it('should require MANAGE_GUILD permission', function() {
    message.member.permissions.delete('MANAGE_GUILD')
    locale(message, ['list'])
    return expect(spy.returnValues[0]).to.eventually.have.nested.property('content').include('permission')
  })

  describe('get', function() {
    it('should return the current locale', function() {
      locale(message, ['get'])
      return expect(spy.returnValues[0]).to.eventually.have.nested.property('content').include('set to en_US')
    })
  })

  describe('list', function() {
    it('should list available locales', function() {
      locale(message, ['list'])
      return expect(spy.returnValues[0]).to.eventually.have.deep.nested.property('content.title').include('Available')
    })
  })

  describe('set', function() {
    it('should require specified locale', function() {
      locale(message, ['set'])
      return expect(spy.returnValues[0]).to.eventually.have.property('content').include('No locale')
    })

    it('should notify user if locale is unavailable', function() {
      locale(message, ['set', 'nonexistent-locale'])
      return expect(spy.returnValues[0]).to.eventually.have.property('content').include('locale is unavailable')
    })

    it('should set server locale', function() {
      i18n.setServerLocale('localeTest', 'i18n_test')
      locale(message, ['set', 'en_US'])
      expect(i18n.getServerLocale('localeTest')).to.equal('en_US')
      return expect(spy.returnValues[0]).to.eventually.have.property('content').include('set locale to')
    })
  })
})
