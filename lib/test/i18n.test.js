'use strict'
/* eslint-env mocha */
require('module-alias/register')
const fs = require('fs')
const path = require('path')
const chai = require('chai')
const mockfs = require('mock-fs')
const { defaultLocale } = require('$config')
const i18n = require('../i18n')
const expect = chai.expect
const __ = i18n.translate
const _s = i18n.substitute

describe('i18n', function() {
  const localizations = path.join(__dirname, '../../lang/server-localizations.json')
  beforeEach(function() {
    i18n.setServerLocale('i18', 'i18n_test')
    i18n.setServerLocale('i18-alt', 'i18n_alt_test')
  })

  describe('initialization', function() {
    it('loads server localizations', function() {
      expect(i18n.getServerLocale('i18ntestserver')).to.equal('i18n_test')
    })
  })

  describe('#saveServerLocalizations', function() {
    it('saves server locale data', function() {
      mockfs({ lang: {} })
      i18n.setServerLocale('test', 'i18n')
      i18n.saveServerLocalizations()
      expect(fs.readFileSync(localizations, 'utf8')).to.include('"test": "i18n"')
      mockfs.restore()
    })
  })

  describe('#translate', function() {
    it('translates a key', function() {
      expect(__('i18n.test', 'i18')).to.equal('value')
    })

    it('translates depending on guild ID', function() {
      expect(__('i18n.test', 'i18-alt')).to.equal('alt value')
    })

    it('throws error if missing keys', function() {
      expect(() => { __('nonexistent-key', 'i18') }).to.throw('Key nonexistent-key not present in i18n_test')
    })
  })

  describe('#substitute', function() {
    it('substitutes named fields', function() {
      expect(_s('i18n.fieldTest', 'i18', { location: 'world', module: 'i18n' }))
        .to.equal('hello world from the i18n test')
    })

    it('substitutes positional placeholders', function() {
      expect(_s('i18n.placeholderTest', 'i18', 'world', 'again')).to.equal('hello world again')
    })

    it('substitutes both placeholders and named fields', function() {
      expect(_s('i18n.combinedSubstitutionTest', 'i18', { field: 'a', field2: 'here' }, 'put', 'reference'))
        .to.equal('put a reference here')
    })

    it('throws error if not all substitutions can be made', function() {
      expect(() => { _s('i18n.insufficientSubstitutionsTest', 'i18', 'one') }).to.throw('Not enough substitutions provided to replace string:')
    })
  })

  describe('#has', function() {
    it('returns if key is present in locale', function() {
      expect(i18n.has('i18n.test', 'i18')).to.equal(true)
      expect(i18n.has('nonexistent-key', 'i18')).to.equal(false)
    })

    it('falls back to default locale if guild not specified', function() {
      expect(i18n.has('i18n.test')).to.equal(false)
      expect(i18n.has('main.commandNotFound')).to.equal(true)
    })
  })

  describe('#getServerLocale', function() {
    it('returns the current server\'s locale', function() {
      expect(i18n.getServerLocale('i18')).to.equal('i18n_test')
    })

    it('returns the default locale if current server has no data', function() {
      expect(i18n.getServerLocale('nonexistent server')).to.equal(defaultLocale)
    })
  })

  describe('#getAvailableLocales', function() {
    it('returns available locales', function() {
      expect(i18n.getAvailableLocales()).to.include('i18n_test')
    })
  })

  describe('#useGuild', function() {
    it('wraps translate() and substitute() with guildId', function() {
      const { __, _s } = i18n.useGuild('i18-alt')
      expect(__('i18n.test')).to.equal('alt value')
      expect(_s('i18n.combinedSubstitutionTest', { field: 'field' }, 'placeholder')).to.equal('alt placeholder field')
    })
  })
})
