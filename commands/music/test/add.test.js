'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const expect = chai.expect
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

const mockery = require('mockery')
const mock = () => {}
mock.validateURL = require('ytdl-core').validateURL
mock.getURLVideoID = () => {}

const fakeMetadata = {
  view_count: 0,
  description: 'description',
  upload_date: '20181228',
  tags: []
}

const originalJoin = require('../join').execute
const joinMock = { execute: message => message.doNotConnect ? Promise.resolve(null) : originalJoin(message, []) }
delete require.cache[require.resolve('../join')]

mockery.enable()
mockery.warnOnUnregistered(false)
mockery.registerMock('ytdl-core', mock)
mockery.registerMock('ytdl-getinfo', { getInfo: () => Promise.resolve({ items: [fakeMetadata] }) })
mockery.registerMock('./join', joinMock)

const manager = require('../QueueManager')
const add = require('../add').execute

describe('add', function () {
  let translate, play, message
  beforeEach(function () {
    message = new Message()
    message._createVoiceChannel()
    translate = sinon.spy(i18n, 'translate')
    play = sinon.spy(message.member.voiceChannel.connection, 'playStream')
  })
  afterEach(function () {
    translate.restore()
    message.member.voiceChannel.connection.dispatcher.emit('end')
    manager.flush(message.guild.id)
  })
  after(function () { mockery.disable() })

  it('notifies user of insufficient arguments', function () {
    add(message, [])
    expect(translate).to.be.calledWith('add.insufficientArgs')
  })

  it('notifies user of invalid URL', function () {
    add(message, ['theSong'])
    expect(translate).to.be.calledWith('add.invalidURL')
  })

  it('does nothing if member has no voice channel', function () {
    const copy = message.member.voiceChannel
    message.member.voiceChannel = null
    return add(message, ['https://www.youtube.com/watch?v=00000000000'])
      .then(() => {
        message.member.voiceChannel = copy
        const Q = manager.getQueue(message.guild.id)
        expect(Q).to.equal(undefined)
        expect(translate).to.be.calledWith('join.noVoiceChannel')
        expect(message.guild.me.voiceChannel).to.equal(undefined)
      })
  })

  it('joins a channel if not connected', function () {
    return add(message, ['https://www.youtube.com/watch?v=00000000000'])
      .then(() => {
        expect(translate).to.be.calledWith('join.success')
      })
  })

  it('plays a song if the queue is empty', function () {
    return add(message, ['https://www.youtube.com/watch?v=00000000000'])
      .then(() => {
        expect(play).to.be.called()
      })
  })

  it('hides a song\'s name if added with the secret option', function () {
    return add(message, ['https://www.youtube.com/watch?v=00000000000', '-s'])
      .then(() => {
        expect(play).to.be.called()
        expect(translate).to.not.be.calledWith('add.success')
      })
  })

  it('adds song to queue if the queue is not empty', function () {
    return add(message, ['https://www.youtube.com/watch?v=00000000000'])
      .then(() => add(message, ['https://www.youtube.com/watch?v=00000000000']))
      .then(() => add(message, ['https://www.youtube.com/watch?v=00000000000']))
      .then(() => {
        const Q = manager.getQueue(message.guild.id)
        expect(Q.length).to.equal(3)
        manager.flush(message.guild.id)
      })
  })

  it('plays the next song in the queue', function () {
    return add(message, ['https://www.youtube.com/watch?v=00000000000'])
      .then(() => add(message, ['https://www.youtube.com/watch?v=00000000000']))
      .then(() => {
        message.member.voiceChannel.connection.dispatcher.emit('end')
        expect(play).to.be.calledTwice()
      })
  })

  it('leaves the channel when queue is empty', function () {
    return add(message, ['https://www.youtube.com/watch?v=00000000000'])
      .then(() => {
        message.member.voiceChannel.connection.dispatcher.emit('end')
        expect(translate).to.be.calledWith('add.complete')
      })
  })

  it('notifies the user if an error occurs', function () {
    message.channel.send = str => { if (!str.includes('unknown')) throw new Error() }
    return add(message, ['https://www.youtube.com/watch?v=00000000000'])
      .then(() => {
        expect(translate).to.be.calledWith('main.unknownError')
      })
  })

  it('cleans up if connection is lost before playing a song', function () {
    // fake a lost connection by never setting the voice channel
    message.doNotConnect = true
    return add(message, ['https://www.youtube.com/watch?v=00000000000'])
      .then(() => {
        expect(translate).to.be.calledWith('add.lostConnection')
      })
  })
})
