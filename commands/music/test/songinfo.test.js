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
const songinfo = require('../songinfo').execute

describe('songinfo', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })
  after(function () { mockery.disable() })

  it('notifies user nothing is playing when queue is empty', function () {
    songinfo(message, [])
    expect(spy).to.always.be.calledWith('queue.notPlaying')
  })

  it('requires an index argument', function () {
    return manager.add('some song', message.guild.id)
      .then(() => {
        songinfo(message, [])
        songinfo(message, ['a string'])
        expect(spy).to.always.be.calledWith('songinfo.insufficientArgs')
      })
  })

  it('notifies user if index is not in queue', function () {
    return manager.add('some song', message.guild.id)
      .then(() => {
        songinfo(message, ['99999'])
        expect(spy).to.always.be.calledWith('songinfo.invalidIndex')
      })
  })

  it('prints a song\'s metadata', function () {
    return manager.add('some song', message.guild.id)
      .then(() => {
        songinfo(message, ['1'])
        expect(spy).to.be.calledWith('songinfo.field.tags')
        expect(spy).to.be.calledWith('songinfo.field.likeInfo')
      })
  })
})
