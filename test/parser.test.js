'use strict'
/* eslint-env mocha */
const expect = require('chai').expect
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
    let spy
    beforeEach(function() {
      spy = sinon.spy(message.channel, 'send')
    })

    afterEach(function() {
      spy.restore()
    })
    it('should set short standalone options', function() {
      expect(getopts(['-a', '-b', '-c'], 'abc').flags).to.deep.equal(['a', 'b', 'c'])
    })

    it('should set a sequence of standalone options', function() {
      expect(getopts(['-abc'], 'abc').flags).to.deep.equal(['a', 'b', 'c'])
    })

    it('should set long standalone options', function() {
      const { flags } = getopts(['--option', '--foobar'], '', ['option', 'foobar'])
      expect(flags).to.deep.equal(['option', 'foobar'])
    })

    it('should unalias standalone long options representing short ones', function() {
      const { flags } = getopts(['--alias'], '', ['alias=a'])
      expect(flags).to.deep.equal(['a'])
    })

    it('should set short parameterized options', function() {
      expect(getopts(['-o', 'opt'], 'o:')).to.deep.equal({ o: 'opt', flags: [] })
    })

    it('should set long parameterized options', function() {
      expect(getopts(['--set-option', 'value'], '', ['set-option:'])).to.deep.equal({ 'set-option': 'value', flags: [] })
    })

    it('should not let parameterized options use other options as params', function() {
      getopts(['-o', '-a'], 'ao:', [], message.channel.send)
      getopts(['--param', '--option'], '', ['param:', 'option'], message.channel.send)
      expect(spy.returnValues[0]).to.include('requires an argument')
      expect(spy.returnValues[1]).to.include('requires an argument')
    })

    it('should unalias long parameterized options representing short ones', function() {
      expect(getopts(['--alias', 'value'], '', ['alias:=a'])).to.deep.equal({ 'a': 'value', flags: [] })
    })

    it('should leave regular command arguments alone', function() {
      const args = ['-o', 'opt', 'arg1', '-a', 'arg2', '-p', 'param']
      expect(getopts(args, 'o:p:a')).to.deep.equal({ o: 'opt', p: 'param', flags: ['a'] })
      expect(args).to.deep.equal(['arg1', 'arg2'])
    })

    it('should handle a mix of short (+ sequenced), long, parameterized, and standalone options', function() {
      const options = getopts(['-a', '-bc', '--long', '-o', 'opt', '--param', 'par'], 'abco:', ['long', 'param:'])
      expect(options).to.deep.equal({ o: 'opt', param: 'par', flags: ['a', 'b', 'c', 'long'] })
    })

    it('should handle parameterized option combined on end of multiple standalones', function() {
      expect(getopts(['-xvf', 'file'], 'xvf:')).to.deep.equal({ f: 'file', flags: ['x', 'v'] })
    })

    it('should not process options after a bare dash --', function() {
      expect(getopts(['-a', '-b', '-o', 'opt', '--', '-arg', '--not-an-opt', '-a'], 'abo:')).to.deep.equal({ o: 'opt', flags: ['a', 'b'] })
    })

    it('should notify user if parameterized option is squeezed between standalone flags', function() {
      getopts(['-xfv', 'file'], 'xvf:', [], message.channel.send)
      expect(spy.returnValues[0]).to.include('out of order')
    })

    it('should notify user if an unknown option is given', function() {
      getopts(['-a', '-n', 'arg'], 'a', [], message.channel.send)
      expect(spy.returnValues[0]).to.include('not a valid option')
    })

    it('should notify user if parameterized option is not given argument', function() {
      getopts(['-o'], 'o:', [], message.channel.send)
      getopts(['--param'], '', ['param:'], message.channel.send)
      expect(spy.returnValues[0]).to.include('requires an argument')
      expect(spy.returnValues[1]).to.include('requires an argument')
    })
  })
})
