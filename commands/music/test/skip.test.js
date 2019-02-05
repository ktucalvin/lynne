'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const skip = require('../skip').execute
const expect = chai.expect

describe('skip', function () {
  let spy, message, dispatcher
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    dispatcher = message.member.voiceChannel.connection.dispatcher
    spy = sinon.spy(dispatcher, 'end')
  })
  afterEach(function () { spy.restore() })
  after(function () { manager.flush(message.guild.id) })

  it('does nothing if there is no dispatcher', function () {
    skip(message, [])
    expect(spy).to.not.be.called()
  })

  it('ends the current stream if there is one', function () {
    manager._inject({}, message.guild.id)
    manager.attachDispatcher(dispatcher, message.guild.id)
    skip(message, [])
    expect(spy).to.be.called()
  })
})
