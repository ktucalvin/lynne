'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const message = require('$structures/FakeMessage')
let locale
const expect = chai.expect
chai.use(require('sinon-chai'))

describe('locale', function() {
  let spy
  before(function() {
    i18n.init()
    message.member.permissions.set('MANAGE_GUILD')

    // Lazy load to allow i18n to init first, since command caches available locales
    locale = require('../locale').execute
  })
  beforeEach(function() { spy = sinon.spy(i18n, 'translate') })
  afterEach(function() { spy.restore() })

  it('requires a subcommand specified', function() {
    locale(message, [])
    expect(spy).to.be.calledWith('locale.noBehaviorSpecified')
  })

  describe('get', function() {
    it('returns the current locale', function() {
      locale(message, ['get'])
      expect(spy).to.be.calledWith('locale.get')
    })
  })

  describe('list', function() {
    it('lists available locales', function() {
      locale(message, ['list'])
      expect(spy).to.be.calledWith('locale.list.availableLocales')
    })
  })

  describe('set', function() {
    it('requires a locale is specified', function() {
      locale(message, ['set'])
      expect(spy).to.be.calledWith('locale.set.noLocaleSpecified')
    })

    it('notifies user if locale is unavailable', function() {
      locale(message, ['set', 'nonexistent-locale'])
      expect(spy).to.be.calledWith('locale.set.localeUnavailable')
    })

    it('sets server locale', function() {
      i18n.setServerLocale(message.guild.id, 'i18n_test')
      locale(message, ['set', 'en_US'])
      expect(i18n.getServerLocale(message.guild.id)).to.equal('en_US')
      expect(spy).to.be.calledWith('locale.set.success')
    })
  })
})
