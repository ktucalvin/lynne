'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const qremove = require('../qremove').execute
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
    qremove(message, [])
    expect(spy).to.be.calledWith('queue.notPlaying')
  })

  it('requires an index argument', function () {
    manager._inject({ queue: [{}] }, message.guild.id)
    qremove(message, [])
    qremove(message, ['strings are not indices'])
    expect(spy).to.always.be.calledWith('skipto.invalidIndex')
  })

  it('notifies user if index is not in queue', function () {
    manager._inject({ queue: [{}] }, message.guild.id)
    qremove(message, ['9999'])
    qremove(message, ['-5'])
    expect(spy).to.always.be.calledWith('skipto.indexOutOfBounds')
  })

  it('skips the current song if index is 1', function () {
    const dispatcher = { end: () => {} }
    const end = sinon.spy(dispatcher, 'end')
    manager._inject({ dispatcher, queue: [{}] }, message.guild.id)
    qremove(message, ['1'])
    expect(end).to.be.called()
  })

  it('removes the song at a valid index', function () {
    const queue = '123456789'.split('')
    manager._inject({ queue }, message.guild.id)
    qremove(message, ['5'])
    expect(queue[4]).to.equal('6')
    expect(queue).to.not.include('5')
  })
})
