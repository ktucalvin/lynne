'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const OperationalError = require('$structures/OperationalError')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const join = require('../join').execute
const expect = chai.expect
chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))

describe('join', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    spy = sinon.spy(message.member.voiceChannel, 'join')
  })
  afterEach(function () { spy.restore() })

  it('notifies user if they\'re not in a voice channel', function () {
    message.member.voiceChannel = null
    return expect(join(message, [])).to.eventually.be.rejectedWith(OperationalError)
  })

  it('joins a user\'s voice channel', function () {
    return expect(join(message, [])).to.eventually.have.property('playStream')
  })
})
