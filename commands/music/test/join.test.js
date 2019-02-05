'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const OperationalError = require('$structures/OperationalError')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const join = require('../join').execute
const expect = chai.expect

describe('join', function () {
  let message
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
  })

  it('notifies user if they\'re not in a voice channel', function () {
    message.member.voiceChannel = null
    return expect(join(message, [])).to.eventually.be.rejectedWith(OperationalError)
  })

  it('joins a user\'s voice channel', function () {
    return expect(join(message, [])).to.eventually.have.property('playStream')
  })
})
