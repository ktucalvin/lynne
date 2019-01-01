'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const skipto = require('../skipto').execute
const expect = chai.expect
chai.use(require('sinon-chai'))
chai.use(require('dirty-chai'))

describe('skip', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    message.guild.me.voiceChannel = new VoiceChannel()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })
  after(function () { manager.flush(message.guild.id) })

  it('notifies user nothing is playing when queue is empty', function () {
    skipto(message, [])
    expect(spy).to.be.calledWith('queue.notPlaying')
  })

  it('requires an index argument', function () {
    manager._inject({ queue: [{}] }, message.guild.id)
    skipto(message, [])
    skipto(message, ['strings are not indices'])
    expect(spy).to.always.be.calledWith('skipto.invalidIndex')
  })

  it('notifies user if index is not in queue', function () {
    manager._inject({ queue: [{}] }, message.guild.id)
    skipto(message, ['9999'])
    skipto(message, ['-5'])
    expect(spy).to.always.be.calledWith('skipto.indexOutOfBounds')
  })

  it('does not allow skipping to the current song', function () {
    manager._inject({ queue: [{}] }, message.guild.id)
    skipto(message, ['1'])
    expect(spy).to.always.be.calledWith('skipto.cannotSkipCurrentSong')
  })

  it('skips to the correct index', function () {
    const queue = '123456789'.split('')
    manager._inject({ dispatcher: { end: () => {} }, queue }, message.guild.id)
    skipto(message, ['5'])
    expect(queue[0]).to.equal('4') // dispatcher.end() will shift the queue and play 5
  })
})
