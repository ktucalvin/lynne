'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const playing = require('../playing').execute
const expect = chai.expect
chai.use(require('sinon-chai'))

const fakeMetadata = {
  view_count: 0,
  description: 'description',
  upload_date: '20181228'
}

describe('playing', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })

  it('notifies user nothing is playing when queue is empty', function () {
    playing(message, [])
    expect(spy).to.be.calledWith('queue.notPlaying')
  })

  it('prints the currently playing song', function () {
    manager._inject({ queue: [fakeMetadata] }, message.guild.id)
    playing(message, [])
    expect(spy).to.be.calledWith('playing.nowPlaying')
  })

  it('prints more details if passed -d', function () {
    manager._inject({ queue: [fakeMetadata] }, message.guild.id)
    playing(message, ['-d'])
    expect(spy).to.be.calledWith('songinfo.field.tags')
  })

  it('hides the current song if it was added secretly', function () {
    fakeMetadata.secret = true
    manager._inject({ queue: [fakeMetadata] }, message.guild.id)
    playing(message, [])
    expect(spy).to.be.calledWith('playing.secret')
  })
})
