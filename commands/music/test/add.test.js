'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const manager = require('../QueueManager')

const expect = chai.expect
chai.use(require('chai-as-promised'))
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

const mockery = require('mockery')
const mock = () => {}
mock.validateURL = require('ytdl-core').validateURL
mockery.enable()
mockery.warnOnUnregistered(false)
mockery.registerMock('ytdl-core', mock)

const add = require('../add').execute

describe('add', function () {
  let translate, message
  beforeEach(function () {
    message = new Message()
    message._createVoiceChannel()
    translate = sinon.spy(i18n, 'translate')
  })
  afterEach(function () {
    translate.restore()
    message.member.voiceChannel.connection.dispatcher.emit('end')
    manager.flush(message.guild.id)
  })
  after(mockery.disable)

  it('notifies user of insufficient arguments', function () {
    add(message, [])
    expect(translate).to.be.calledWith('add.insufficientArgs')
  })

  it('notifies user of invalid URL', function () {
    add(message, ['theSong'])
    expect(translate).to.be.calledWith('add.invalidURL')
  })

  it('does nothing if member has no voice channel', function (done) {
    const copy = message.member.voiceChannel
    message.member.voiceChannel = null
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      message.member.voiceChannel = copy
      const Q = manager.get(message.guild.id)
      expect(Q).to.equal(undefined)
      expect(translate).to.be.calledWith('join.noVoiceChannel')
      expect(message.guild.me.voiceChannel).to.equal(undefined)
      done()
    })
  })

  it('joins a channel if not connected', function (done) {
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      expect(translate).to.be.calledWith('join.success')
      done()
    })
  })

  it('plays a song if the queue is empty', function (done) {
    const spy = sinon.spy(message.member.voiceChannel.connection, 'playStream')
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      expect(spy).to.be.called()
      done()
    })
  })

  it('adds song to queue if the queue is not empty', function () {
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    const Q = manager.get(message.guild.id)
    expect(Q.length).to.equal(3)
    manager.flush(message.guild.id)
  })

  it('plays the next song in the queue', function (done) {
    const spy = sinon.spy(message.member.voiceChannel.connection, 'playStream')
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    message.member.voiceChannel.connection.dispatcher.emit('end')
    setTimeout(() => {
      expect(spy).to.be.calledTwice()
      done()
    })
  })

  it('leaves the channel when queue is empty', function (done) {
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      message.member.voiceChannel.connection.dispatcher.emit('end')
      expect(translate).to.be.calledWith('add.complete')
      done()
    })
  })
})
