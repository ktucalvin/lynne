'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const mockfs = require('mock-fs')
const fs = require('fs')
const { defaultLocale } = require('../config.json')
const i18n = require('../i18n')
const __ = i18n.translate
const _r = i18n.substitute

describe('i18n', function() {
  describe('before init', function() {
    it('should error if no locales registered', function() {
      expect(() => { __('i18n.test', 'i18') }).to.throw('No locales registered')
    })
  })

  describe('after init', function() {
    before(function() {
      i18n.init()
      i18n.setServerLocale('i18', 'i18n_test')
      i18n.setServerLocale('i18-alt', 'i18n_alt_test')
    })

    it('should preserve server locale data', function() {
      mockfs({
        lang: {
          'server-localizations.json': '{}'
        }
      })
      i18n.setServerLocale('test', 'i18n')
      i18n.saveServerLocalizations()
      expect(fs.readFileSync('./lang/server-localizations.json', 'utf8')).to.include('"test": "i18n"')
      mockfs.restore()
    })

    it('should return the current server\'s locale', function() {
      expect(i18n.getServerLocale('i18')).to.equal('i18n_test')
    })

    it('should return the default locale if current server has no data', function() {
      expect(i18n.getServerLocale('nonexistent server')).to.equal(defaultLocale)
    })

    it('should translate a key', function() {
      expect(__('i18n.test', 'i18')).to.equal('value')
    })

    it('should translate differently given guild ID', function() {
      expect(__('i18n.test', 'i18-alt')).to.equal('alternative value')
    })

    it('should return available locales', function() {
      expect(i18n.getAvailableLocales()).to.include('i18n_test')
    })

    it('should error if missing keys', function() {
      expect(() => { __('nonexistent-key', 'i18') }).to.throw('Key nonexistent-key not present in i18n_test')
    })

    it('should substitute named fields', function() {
      expect(_r('i18n.fieldTest', 'i18', { location: 'world', module: 'i18n' }))
        .to.equal('hello world from the i18n test')
    })

    it('should substitute positional placeholders', function() {
      expect(_r('i18n.placeholderTest', 'i18', 'world', 'again')).to.equal('hello world again')
    })

    it('should substitute both placeholders and named fields', function() {
      expect(_r('i18n.combinedSubstitutionTest', 'i18', { field: 'a', field2: 'here' }, 'put', 'reference'))
        .to.equal('put a reference here')
    })

    it('should error if not all substitutions could be made', function() {
      expect(() => { _r('i18n.insufficientSubstitutionsTest', 'i18', 'one') }).to.throw('Not enough substitutions provided to replace string:')
    })
  })
})
