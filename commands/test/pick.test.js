'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const message = require('$structures/FakeMessage')
const pick = require('../pick').execute
const expect = chai.expect
chai.use(require('sinon-chai'))

describe('pick', function() {
  let translate, substitute
  before(function() { i18n.init() })
  beforeEach(function() {
    translate = sinon.spy(i18n, 'translate')
    substitute = sinon.spy(i18n, 'substitute')
  })
  afterEach(function() {
    translate.restore()
    substitute.restore()
  })

  it('notifies user if less than two arguments provided', function() {
    pick(message, [])
    expect(translate).to.be.calledWith('pick.insufficientOptions')
  })

  it('picks from a range of given options', function() {
    pick(message, ['a', 'b'])
    expect(substitute).to.be.calledWith('pick.choose', sinon.match.string)
  })

  it('picks from a numeric range if passed -r', function() {
    pick(message, ['-r', '--', '-100', '100'])
    expect(substitute).to.be.calledWith('pick.choose', sinon.match(val => val >= -100 && val <= 100, 'chosen value not in range'))
  })

  it('automatically swaps numeric bounds if given out of order', function() {
    pick(message, ['-r', '--', '100', '-100'])
    expect(substitute).to.be.calledWith('pick.choose', sinon.match(val => val >= -100 && val <= 100, 'chosen value not in range'))
  })

  it('rejects non-numeric input for ranged pick', function() {
    pick(message, ['-r', '1', 'A'])
    expect(translate).to.be.calledWith('pick.ranged.nonNumericLimit')
  })

  it('picks a card if passed -c', function() {
    pick(message, ['-c'])
    expect(substitute).to.be.calledWith('pick.card.draw')
  })
})
