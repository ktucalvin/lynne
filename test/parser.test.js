'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const { parse, getopts } = require('../parser')
const { prefix, names } = require('../config.json')

function testAllIdentifiers(command, result) {
  for (const name of names) {
    expect(parse(name + command)).to.deep.equal(result)
  }
  expect(parse(prefix + command)).to.deep.equal(result)
}

describe('parser', function() {
  describe('parse()', function() {
    it('should not process non-commands', function() {
      expect(parse('simple message')).to.deep.equal({})
    })

    it('should parse command with no arguments', function() {
      testAllIdentifiers(' command', { name: 'command', args: [] })
    })

    it('should parse command with multiple arguments', function() {
      testAllIdentifiers(' command arg1 arg2', { name: 'command', args: ['arg1', 'arg2'] })
    })

    it('should ignore capitalization of the identifier', function() {
      for (let name of names) {
        name = name.charAt(0).toUpperCase() + name.slice(1)
        expect(parse(name + ' command arg1 arg2')).to.deep.equal({ name: 'command', args: ['arg1', 'arg2'] })
      }
    })

    it('should throw EmptyCommand if no command specified', function() {
      expect(() => { parse(prefix) }).to.throw(SyntaxError, 'EmptyCommand')
    })

    it('should parse punctuated command with no arguments', function() {
      testAllIdentifiers(', command!!', { name: 'command', args: [] })
    })

    it('should parse punctuated command with arguments', function() {
      testAllIdentifiers(', command:: arg1 arg2', { name: 'command', args: ['arg1', 'arg2'] })
    })

    it('should collapse quoted arguments', function() {
      testAllIdentifiers(' command "spaced argument" "second argument"', { name: 'command', args: ['spaced argument', 'second argument'] })
    })

    it('should collapse single quoted arguments', function() {
      testAllIdentifiers(" command 'single quoted' 'arguments with space'", { name: 'command', args: ['single quoted', 'arguments with space'] })
    })

    it('should escape single and double quotes if prefixed with backslash', function() {
      testAllIdentifiers(' command "escaped \\" double"', { name: 'command', args: ['escaped " double'] }) // eslint-disable-line
      testAllIdentifiers(" command 'escaped \\' single'", { name: 'command', args: ["escaped ' single"] }) // eslint-disable-line
    })

    it('should parse a mix of quoted and non-quoted arguments', function() {
      testAllIdentifiers(' command "a b c" arg1 \'1 2 3\' arg2', { name: 'command', args: ['a b c', 'arg1', '1 2 3', 'arg2'] })
    })

    it('should throw MissingQuote for invalid quoted argument', function() {
      for (const name of names) {
        expect(() => { parse(name + ' command "invalid quote') }).to.throw(SyntaxError, 'MissingQuote')
      }
    })

    it('should strip non-quoted whitespace', function() {
      testAllIdentifiers(' command   arg1   arg2    "with    whitespace"    ', { name: 'command', args: ['arg1', 'arg2', 'with    whitespace'] })
    })
  })

  describe('getopts()', function() {
    const sinon = require('sinon')
    const message = require('../commands/test/fake-message')
    const optmap = new Map()
      .set('standalone', { alias: 's' })
      .set('option', { alias: 'o' })
      .set('parameterized', { alias: 'p', hasParam: true })
      .set('default-param', { alias: 'd', hasParam: true, default: 'DEFAULT' })
      .set('no-alias')

    let spy
    beforeEach(function() {
      spy = sinon.spy(message.channel, 'send')
    })

    afterEach(function() {
      spy.restore()
    })

    it('should set a standalone option', function() {
      expect(getopts(['-s'], optmap).get('flags')).to.include('standalone')
      expect(getopts(['--standalone'], optmap).get('flags')).to.include('standalone')
    })

    it('should set a parameterized option', function() {
      expect(getopts(['-p', 'param'], optmap).get('parameterized')).to.equal('param')
      expect(getopts(['--parameterized', 'param'], optmap).get('parameterized')).to.equal('param')
    })

    it('should set a default value if an option is missing a parameter', function() {
      expect(getopts(['-d'], optmap).get('default-param')).to.equal('DEFAULT')
    })

    it('should not allow another option to be used as a parameter', function() {
      expect(getopts(['-d', '-o'], optmap).get('default-param')).to.equal('DEFAULT')
    })

    it('should use the latest specified options', function() {
      expect(getopts(['-p', 'first', '-p', 'latest'], optmap).get('parameterized')).to.equal('latest')
    })

    it('should process a sequence of flags', function() {
      const opts = getopts(['-so'], optmap)
      expect(opts.get('flags')).to.deep.equal(['standalone', 'option'])
    })

    it('should strip options from argument array', function() {
      const args = ['arg1', '-so', 'arg2', '--parameterized', 'param', 'arg3', '--', '-o']
      getopts(args, optmap)
      expect(args).to.deep.equal(['arg1', 'arg2', 'arg3', '-o'])
    })

    it('should reject parameterized flag between standalones', function() {
      expect(() => { getopts(['-spo'], optmap) }).to.throw(SyntaxError)
    })

    it('should reject nonexistent flag', function() {
      expect(() => { getopts(['--nonexistent-flag'], optmap) }).to.throw(SyntaxError)
    })

    it('should reject nonexistent flag in sequence', function() {
      expect(() => { getopts(['-sz'], optmap) }).to.throw(SyntaxError)
    })

    it('should not process flags past a double dash', function() {
      const opts = getopts(['-s', '--', '-o'], optmap)
      expect(opts).to.not.include('option')
    })

    it('should return immediately if no token is prefixed with a dash', function() {
      expect(getopts(['arg1', 'arg2'], optmap)).to.deep.equal(new Map().set('flags', []))
    })
  })
})
