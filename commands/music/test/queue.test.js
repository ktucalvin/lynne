'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const manager = require('../QueueManager')
const queue = require('../queue').execute
const expect = chai.expect
chai.use(require('sinon-chai'))

describe('queue', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })
  after(function () { manager.flush(message.guild.id) })

  it('notifies user nothing is playing when queue is empty', function () {
    manager.flush(message.guild.id)
    queue(message, [])
    expect(spy).to.be.calledWith('queue.notPlaying')
  })

  it('prints the music queue', function () {
    const send = sinon.spy(message.channel, 'send')
    manager._inject({ queue: [{ title: 'title', url: 'test://test.test' }, {}, {}] }, message.guild.id)
    queue(message, [])
    expect(send.returnValues[0]).to.be.an.instanceof(RichEmbed)
    expect(send.returnValues[0].description).to.include('title')
    expect(send.returnValues[0].description).to.include('3.')
  })
})
