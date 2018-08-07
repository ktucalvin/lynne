'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const i18n = require('../i18n')
const __ = i18n.translate
const _r = i18n.substitute

describe('i18n', function() {
  it('should error if module not pre-initialized', function() {
    i18n.clear()
    expect(() => { __('i18n-test') }).to.throw('I18n module was not initialized before use')
  })

  it('should error if json file does not exist', function() {
    expect(() => { i18n.init('fa_KE') }).to.throw('fa_KE does not have json file')
  })

  it('should translate a key', function() {
    i18n.init('i18n_test')
    expect(__('i18n.test')).to.equal('value')
  })

  it('should error if missing keys', function() {
    expect(() => { __('nonexistent-key') }).to.throw('Key nonexistent-key not present in i18n_test')
  })

  it('should substitute named fields', function() {
    expect(_r('i18n.fieldTest', { location: 'world', module: 'i18n' }))
      .to.equal('hello world from the i18n test')
  })

  it('should substitute positional placeholders', function() {
    expect(_r('i18n.placeholderTest', 'world', 'again')).to.equal('hello world again')
  })

  it('should substitute both placeholders and named fields', function() {
    expect(_r('i18n.combinedSubstitutionTest', { field: 'a', field2: 'here' }, 'put', 'reference'))
      .to.equal('put a reference here')
  })

  it('should error if not all substitutions could be made', function() {
    expect(() => { _r('i18n.insufficientSubstitutionsTest', 'one') }).to.throw('Not enough substitutions provided to replace string:')
  })

  after(i18n.clear)
})
