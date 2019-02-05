'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const manager = require('../QueueManager')
const queue = require('../queue').execute
const expect = chai.expect

describe('queue', function () {
  let spy, message, dispatcher
  beforeEach(function () {
    message = new Message()
    spy = sinon.spy(i18n, 'translate')
    dispatcher = new VoiceChannel().connection.dispatcher
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
    manager._inject({ dispatcher, queue: [{ title: 'title', url: 'test://test.test' }, {}, {}] }, message.guild.id)
    queue(message, [])
    expect(send.returnValues[0]).to.be.an.instanceof(RichEmbed)
    expect(send.returnValues[0].description).to.include('title')
    expect(send.returnValues[0].description).to.include('3.')
  })

  it('notes if the queue is paused', function () {
    dispatcher.paused = true
    manager._inject({ dispatcher, queue: [{ title: 'title', url: 'test://test.test' }, {}, {}] }, message.guild.id)
    queue(message, [])
    expect(spy).to.be.calledWith('queue.paused')
  })

  it('hides songs added secretly', function () {
    manager._inject({ dispatcher, queue: [{ title: 'title', url: 'url', secret: true }] }, message.guild.id)
    queue(message, [])
    expect(spy).to.be.calledWith('queue.secret')
  })
})
