'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const registry = require('../registry')
const expect = chai.expect

describe('registry', function () {
  describe('#fetch', function () {
    it('fetches command by name', function () {
      expect(registry.fetch('echo').name).to.equal('echo')
    })
    it('fetches command by alias', function () {
      expect(registry.fetch('say').name).to.equal('echo')
    })
  })
})
