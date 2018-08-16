'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const Utils = require('../utils')

describe('Utils', function() {
  describe('#flatten', function() {
    const obj = {
      first: { second: { third: 'last' } },
      top: { middle: { bottom: 'last' } }
    }

    it('flattens an object', function() {
      expect(Utils.flatten(obj)).to.deep.equal({
        'first.second.third': 'last',
        'top.middle.bottom': 'last'
      })
    })

    it('preserves arrays', function() {
      expect(Utils.flatten({ arr: ['a', 'b'] }))
        .to.deep.equal({ arr: ['a', 'b'] })
    })
  })

  describe('#randInt', function() {
    it('generates a random integer', function() {
      expect(Utils.randInt(-1, 1)).to.be.within(-1, 1)
    })
  })
})
