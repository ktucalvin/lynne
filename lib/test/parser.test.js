'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const expect = chai.expect
const { prefix } = require('$config')
const { parse, getopts } = require('../parser')

describe('parser', function () {
  describe('#parse', function () {
    it('returns null name for non-commands', function () {
      expect(parse('simple message')).to.deep.equal({ name: null })
    })

    it('returns null name if no command specified', function () {
      expect(parse(prefix)).to.deep.equal({ name: null })
    })

    it('parses command with no arguments', function () {
      expect(parse(prefix + 'command')).to.deep.equal({ name: 'command', args: [] })
    })

    it('parses command with multiple arguments', function () {
      expect(parse(prefix + 'command arg1 arg2')).to.deep.equal({ name: 'command', args: ['arg1', 'arg2'] })
    })

    it('collapses quoted arguments', function () {
      expect(parse(prefix + 'command "spaced argument" "second argument"'))
        .to.deep.equal({ name: 'command', args: ['spaced argument', 'second argument'] })
    })

    it('collapses single quoted arguments', function () {
      expect(parse(prefix + "command 'single quoted' 'arguments with space'"))
        .to.deep.equal({ name: 'command', args: ['single quoted', 'arguments with space'] })
    })

    it('escapes single and double quotes prefixed with backslash', function () {
      expect(parse(prefix + 'command "escaped \\" double"')).to.deep.equal({ name: 'command', args: ['escaped " double'] })
      expect(parse(prefix + "command 'escaped \\' single'")).to.deep.equal({ name: 'command', args: ["escaped ' single"] })
    })

    it('parses a mix of quoted and non-quoted arguments', function () {
      expect(parse(prefix + ' command "a b c" arg1 \'1 2 3\' arg2'))
        .to.deep.equal({ name: 'command', args: ['a b c', 'arg1', '1 2 3', 'arg2'] })
    })

    it('throws error if missing quotation mark', function () {
      expect(() => { parse(prefix + 'command "invalid quote') }).to.throw(Error).with.property('key', 'parser.missingQuote')
    })

    it('strips non-quoted whitespace', function () {
      expect(parse(prefix + 'command   arg1   arg2    " with  whitespace "  '))
        .to.deep.equal({ name: 'command', args: ['arg1', 'arg2', ' with  whitespace '] })
    })
  })

  describe('#getopts', function () {
    const optmap = new Map()
      .set('standalone', { alias: 's' })
      .set('option', { alias: 'o' })
      .set('parameterized', { alias: 'p', hasParam: true })
      .set('default-param', { alias: 'd', hasParam: true, default: 'DEFAULT' })
      .set('no-alias')

    it('sets standalone options', function () {
      expect(getopts(['-s'], optmap).get('flags')).to.include('standalone')
      expect(getopts(['--standalone'], optmap).get('flags')).to.include('standalone')
    })

    it('sets parameterized options', function () {
      expect(getopts(['-p', 'param'], optmap).get('parameterized')).to.equal('param')
      expect(getopts(['--parameterized', 'param'], optmap).get('parameterized')).to.equal('param')
    })

    it('sets default value if an option is missing a parameter', function () {
      expect(getopts(['-d'], optmap).get('default-param')).to.equal('DEFAULT')
    })

    it('throws error if parameterized option is not given argument', function () {
      expect(() => { getopts(['-p'], optmap) }).to.throw(Error).with.property('key', 'parser.needsArgument')
    })

    it('does not allow other options to be used as a parameter', function () {
      expect(getopts(['-d', '-o'], optmap).get('default-param')).to.equal('DEFAULT')
    })

    it('uses the latest specified options', function () {
      expect(getopts(['-p', 'first', '-p', 'latest'], optmap).get('parameterized')).to.equal('latest')
    })

    it('processes a sequence of flags', function () {
      const opts = getopts(['-so'], optmap)
      expect(opts.get('flags')).to.deep.equal(['standalone', 'option'])
    })

    it('differentiates between sequences and long options', function () {
      expect(() => getopts(['-standalone'], optmap)).to.throw(Error).with.property('key', 'parser.unknownOption')
    })

    it('sets duplicate flags', function () {
      const opts = getopts(['-soso'], optmap)
      expect(opts.get('flags')).to.deep.equal(['standalone', 'option', 'standalone', 'option'])
    })

    it('strips options from argument array', function () {
      const args = ['arg1', '-so', 'arg2', '--parameterized', 'param', 'arg3', '--', '-o']
      getopts(args, optmap)
      expect(args).to.deep.equal(['arg1', 'arg2', 'arg3', '-o'])
    })

    it('rejects parameterized flag between standalones', function () {
      expect(() => { getopts(['-spo'], optmap) }).to.throw(Error).with.property('key', 'parser.parameterizedBeforeStandalone')
    })

    it('rejects nonexistent flag', function () {
      expect(() => { getopts(['--nonexistent-flag'], optmap) })
        .to.throw(Error).with.nested.property('data.option', 'nonexistent-flag')
    })

    it('rejects nonexistent flag in sequence', function () {
      expect(() => { getopts(['-sz'], optmap) }).to.throw(Error).with.nested.property('data.option', 'z')
    })

    it('does not process flags past a double dash', function () {
      const opts = getopts(['-s', '--', '-o'], optmap)
      expect(opts).to.not.include('option')
    })

    it('returns immediately if no token is prefixed with a dash', function () {
      expect(getopts(['arg1', 'arg2'], optmap)).to.deep.equal(new Map().set('flags', []))
    })
  })
})
