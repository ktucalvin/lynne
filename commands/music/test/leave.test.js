'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const expect = chai.expect
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

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
const leave = require('../leave').execute

describe('leave', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    message.guild.me.voiceChannel = new VoiceChannel()
    spy = sinon.spy(message.guild.me.voiceChannel, 'leave')
  })
  afterEach(function () { spy.restore() })
  after(function () { mockery.disable() })

  it('does nothing if not in a voice channel', function () {
    message.guild.me.voiceChannel = null
    leave(message, [])
    expect(spy).to.not.be.called()
  })

  it('calls leave when in a voice channel', function () {
    leave(message, [])
    expect(spy).to.be.called()
  })

  it('ignores user voice channel', function () {
    message.guild.me.voiceChannel = null
    message.member.voiceChannel = new VoiceChannel()
    leave(message, [])
    expect(spy).to.not.be.called()
  })

  it('empties the queue', function () {
    return manager.add('a', message.guild.id)
      .then(() => manager.add('b', message.guild.id))
      .then(() => manager.add('c', message.guild.id))
      .then(() => {
        leave(message, [])
        expect(manager.get(message.guild.id)).to.equal(undefined)
      })
  })
})
