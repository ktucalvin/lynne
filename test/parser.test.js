'use strict'
/* eslint-env mocha */
const expect = require('chai').expect
const parse = require('../parser')
const { prefix, names } = require('../config.json')

function testAllIdentifiers(command, result) {
  for (const name of names) {
    expect(parse(name + command)).to.deep.equal(result)
  }
  expect(parse(prefix + command)).to.deep.equal(result)
}

describe('parser', function() {
  it('should not process non-commands', function() {
    expect(parse('simple message')).to.deep.equal({})
  })

  it('should parse command with no arguments', function() {
    testAllIdentifiers('command', { name: 'command' })
  })

  it('should parse command with multiple arguments', function() {
    testAllIdentifiers('command arg1 arg2', { name: 'command', args: ['arg1', 'arg2'] })
  })

  it('should throw EmptyCommand if no command specified', function() {
    expect(() => { parse(prefix) }).to.throw(SyntaxError, 'EmptyCommand')
  })

  it('should parse punctuated command with no arguments', function() {
    for (const name of names) {
      expect(parse(`${name}, command`)).to.deep.equal({ name: 'command' })
    }
  })

  it('should parse punctuated command with arguments', function() {
    for (const name of names) {
      expect(parse(`${name}, command: arg1 arg2`))
    }
  })

  it('should collapse quoted arguments', function() {
    testAllIdentifiers('command "spaced argument" "second argument"', { name: 'command', args: ['spaced argument', 'second argument'] })
  })

  it('should collapse single quoted arguments', function() {
    testAllIdentifiers("command 'single quoted' 'arguments with space'", { name: 'command', args: ['single quoted', 'arguments with space'] })
  })

  it('should parse a mix of quoted and non-quoted arguments', function() {
    testAllIdentifiers('command "a b c" arg1 \'1 2 3\' arg2', { name: 'command', args: ['a b c', 'arg1', '1 2 3', 'arg2'] })
  })

  it('should throw MissingQuote for invalid quoted argument', function() {
    for (const name of names) {
      expect(() => { parse(name + ' command "invalid quote') }).to.throw(SyntaxError, 'MissingQuote')
    }
  })

  it('should strip non-quoted whitespace', function() {
    testAllIdentifiers('command   arg1   arg2    "with    whitespace"    ', { name: 'command', args: ['arg1', 'arg2', 'with    whitespace'] })
  })
})
