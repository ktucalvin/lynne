'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const Utils = require('../utils')

describe('Utils', function () {
  describe('#flatten', function () {
    const obj = {
      first: { second: { third: 'last' } },
      top: { middle: { bottom: 'last' } }
    }

    it('flattens an object', function () {
      expect(Utils.flatten(obj)).to.deep.equal({
        'first.second.third': 'last',
        'top.middle.bottom': 'last'
      })
    })

    it('preserves arrays', function () {
      expect(Utils.flatten({ arr: ['a', 'b'] }))
        .to.deep.equal({ arr: ['a', 'b'] })
    })
  })

  describe('#randInt', function () {
    it('generates a random integer', function () {
      expect(Utils.randInt(-1, 1)).to.be.within(-1, 1)
    })

    it('generates the same integer if both bounds are equal', function () {
      expect(Utils.randInt(5, 5)).to.equal(5)
    })
  })

  describe('#secondsToTimeString', function () {
    const format = Utils.secondsToTimeString
    it('formats seconds <60 as 0:ss', function () {
      expect(format(0)).to.equal('0:00')
      expect(format(36)).to.equal('0:36')
    })

    it('formats seconds within [1min, 10min) as m:ss', function () {
      expect(format(60)).to.equal('1:00')
      expect(format(71)).to.equal('1:11')
      expect(format(60 * 5 + 3)).to.equal('5:03')
    })

    it('formats seconds within [10min, 1hr) as mm:ss', function () {
      expect(format(60 * 10)).to.equal('10:00')
      expect(format(60 * 15 + 3)).to.equal('15:03')
      expect(format(60 * 59 + 39)).to.equal('59:39')
    })

    it('formats seconds over 1 hour as h:mm:ss', function () {
      expect(format(60 * 60)).to.equal('1:00:00')
      expect(format(60 * (60 + 11) + 12)).to.equal('1:11:12')
      expect(format(60 * (60 + 4) + 50)).to.equal('1:04:50')
    })
  })
})
