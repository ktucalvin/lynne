'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const play = require('../play').execute
const expect = chai.expect

describe('play', function () {
  let spy, message, dispatcher
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    dispatcher = message.member.voiceChannel.connection.dispatcher
    spy = sinon.spy(dispatcher, 'resume')
  })
  afterEach(function () { spy.restore() })
  after(function () { manager.flush(message.guild.id) })

  it('does nothing if there is no dispatcher', function () {
    play(message, [])
    expect(spy).to.not.be.called()
  })

  it('resumes the current stream', function () {
    manager._inject({}, message.guild.id)
    manager.attachDispatcher(dispatcher, message.guild.id)
    play(message, [])
    expect(spy).to.be.called()
  })
})
