'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const leave = require('../leave').execute
const expect = chai.expect
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

describe('leave', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    message.guild.me.voiceChannel = new VoiceChannel()
    spy = sinon.spy(message.guild.me.voiceChannel, 'leave')
  })
  afterEach(function () { spy.restore() })

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
    manager.add('a', message.guild.id)
    manager.add('b', message.guild.id)
    manager.add('c', message.guild.id)
    leave(message, [])
    expect(manager.get(message.guild.id)).to.equal(undefined)
  })
})
