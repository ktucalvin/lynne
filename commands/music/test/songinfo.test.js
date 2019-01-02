'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const songinfo = require('../songinfo').execute
const expect = chai.expect
chai.use(require('sinon-chai'))

const fakeMetadata = {
  view_count: 0,
  description: 'description',
  upload_date: '20181228'
}

describe('songinfo', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })

  it('notifies user nothing is playing when queue is empty', function () {
    songinfo(message, [])
    expect(spy).to.always.be.calledWith('queue.notPlaying')
  })

  it('requires an index argument', function () {
    manager._inject({ queue: [fakeMetadata] }, message.guild.id)
    songinfo(message, [])
    songinfo(message, ['a string'])
    expect(spy).to.always.be.calledWith('songinfo.invalidIndex')
  })

  it('notifies user if index is not in queue', function () {
    manager._inject({ queue: [fakeMetadata] }, message.guild.id)
    songinfo(message, ['99999'])
    expect(spy).to.always.be.calledWith('songinfo.indexOutOfBounds')
  })

  it('prints a song\'s metadata', function () {
    manager._inject({ queue: [fakeMetadata] }, message.guild.id)
    songinfo(message, ['1'])
    expect(spy).to.be.calledWith('songinfo.field.tags')
    expect(spy).to.be.calledWith('songinfo.field.likeInfo')
  })

  it('hides songs added secretly', function () {
    fakeMetadata.secret = true
    manager._inject({ queue: [fakeMetadata] }, message.guild.id)
    songinfo(message, ['1'])
    expect(spy).to.be.calledWith('songinfo.secret')
  })
})
