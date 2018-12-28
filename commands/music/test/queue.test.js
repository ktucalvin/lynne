'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const expect = chai.expect
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

const mockery = require('mockery')
mockery.enable()
mockery.warnOnUnregistered(false)
mockery.registerMock('ytdl-getinfo', { getInfo: () => Promise.resolve({ items: [{}] }) })

const manager = require('../QueueManager')
const queue = require('../queue').execute

describe('queue', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })
  after(function () {
    mockery.disable()
    manager.flush(message.guild.id)
  })

  it('notifies user nothing is playing when queue is empty', function () {
    manager.flush(message.guild.id)
    queue(message, [])
    expect(spy).to.be.calledWith('queue.notPlaying')
  })

  it('prints the music queue', function () {
    const spy = sinon.spy(message.channel, 'send')
    return manager.add('https://some.link', message.guild.id)
      .then(() => manager.add('a link', message.guild.id))
      .then(() => manager.add('a url', message.guild.id))
      .then(() => {
        queue(message, [])
        expect(spy.returnValues[0]).to.be.an.instanceof(RichEmbed)
        expect(spy.returnValues[0].description).to.include('a link')
        expect(spy.returnValues[0].description).to.include('3.')
      })
  })
})
