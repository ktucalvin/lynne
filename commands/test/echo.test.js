'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
let echo = require('../echo').execute
const expect = chai.expect
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

describe('echo', function () {
  let originalChannel, message, zeroChannel, translate
  beforeEach(function () {
    delete require.cache[require.resolve('../echo')]
    echo = require('../echo').execute
    message = new Message()
    const channel = { id: '0', send: () => {} }
    message.mentions.channels.set('0', channel)
    originalChannel = sinon.spy(message.channel, 'send')
    zeroChannel = sinon.spy(channel, 'send')
    translate = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { translate.restore() })

  it('echoes blank line given no args', function () {
    echo(message, [])
    expect(originalChannel).to.be.calledWith('_ _')
  })

  it('echoes a given string', function () {
    echo(message, ['a', 'given', 'string'])
    expect(originalChannel).to.be.calledWith('a given string_ _')
  })

  describe('#to', function () {
    it('prints to the specified channel', function () {
      echo(message, ['--to', '<#0>', 'string'])
      expect(zeroChannel).to.be.calledWith('string_ _')
    })

    it('prefers --to over --setref if both are given', function () {
      const to = { id: '1', send: () => {} }
      const toSpy = sinon.spy(to, 'send')
      message.mentions.channels.set('1', to)
      echo(message, ['--setref', '<#0>', 'string', '--to', '<#1>'])
      expect(zeroChannel).to.not.be.called()
      expect(toSpy).to.be.calledWith('string_ _')
    })
  })

  describe('#setref', function () {
    it('prints to the specified channel', function () {
      echo(message, ['--setref', '<#0>', 'string'])
      expect(zeroChannel).to.be.calledWith('string_ _')
    })

    it('continues to print to the reference channel', function () {
      echo(message, ['--setref', '<#0>', 'the first call'])
      echo(message, ['--setref', '<#0>', 'the second call'])
      expect(zeroChannel).to.be.calledTwice()
        .and.to.be.calledWith('the first call_ _')
        .and.to.be.calledWith('the second call_ _')
    })

    it('clears the reference channel when given "none"', function () {
      echo(message, ['--setref', 'none', 'string'])
      echo(message, ['second'])
      expect(translate).to.be.calledWith('echo.setref.clear')
    })

    it('notifies user if channel could not be found', function () {
      echo(message, ['--setref', '#nonexistent-channel', 'string'])
      expect(translate).to.be.calledWith('echo.setref.notFound')
    })
  })

  describe('#getref', function () {
    it('notifies user if no reference channel is set', function () {
      echo(message, ['--getref'])
      expect(translate).to.be.calledWith('echo.getref.noReference')
    })

    it('prints the reference channel when it is set', function () {
      echo(message, ['--setref', '<#0>'])
      echo(message, ['--getref'])
      expect(translate).to.be.calledWith('echo.getref.notice')
    })
  })
})
