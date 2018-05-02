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

  it('should parse option flags and set them as readable properties')

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
