'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const expect = chai.expect
chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))
chai.use(require('dirty-chai'))

const mockery = require('mockery')
const fakeMetadata = {
  view_count: 0,
  description: 'description',
  upload_date: '20181228'
}

mockery.enable()
mockery.warnOnUnregistered(false)
mockery.registerMock('ytdl-getinfo', { getInfo: () => Promise.resolve({ items: [fakeMetadata] }) })

const manager = require('../QueueManager')
const playing = require('../playing').execute

describe('playing', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })
  after(function () { mockery.disable() })

  it('notifies user nothing is playing when queue is empty', function () {
    playing(message, [])
    expect(spy).to.be.calledWith('queue.notPlaying')
  })

  it('prints the currently playing song', function () {
    return manager.add('some song', message.guild.id)
      .then(() => {
        playing(message, [])
        expect(spy).to.be.calledWith('playing.nowPlaying')
      })
  })

  it('prints more details if passed -d', function () {
    return manager.add('some song', message.guild.id)
      .then(() => {
        playing(message, ['-d'])
        expect(spy).to.be.calledWith('songinfo.field.tags')
      })
  })
})
