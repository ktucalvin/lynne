'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const pause = require('../pause').execute
const expect = chai.expect
chai.use(require('sinon-chai'))
chai.use(require('dirty-chai'))

describe('pause', function () {
  let spy, message, dispatcher
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    dispatcher = message.member.voiceChannel.connection.dispatcher
    spy = sinon.spy(dispatcher, 'pause')
  })
  afterEach(function () { spy.restore() })
  after(function () { manager.flush(message.guild.id) })

  it('does nothing if there is no dispatcher', function () {
    pause(message, [])
    expect(spy).to.not.be.called()
  })

  it('resumes the current stream', function () {
    manager._inject({}, message.guild.id)
    manager.attachDispatcher(dispatcher, message.guild.id)
    pause(message, [])
    expect(spy).to.be.called()
  })
})
