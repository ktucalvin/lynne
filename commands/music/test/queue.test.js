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
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

describe('queue', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })

  it('notifies user nothing is playing when queue is empty', function () {
    queue(message, [])
    expect(spy).to.be.calledWith('queue.notPlaying')
  })

  it('prints the music queue', function () {
    const spy = sinon.spy(message.channel, 'send')
    manager.add('a link', message.guild.id)
    manager.add('a link', message.guild.id)
    manager.add('a link', message.guild.id)
    queue(message, [])
    expect(spy.returnValues[0]).to.be.an.instanceof(RichEmbed)
    expect(spy.returnValues[0].description).to.include('a link')
    expect(spy.returnValues[0].description).to.include('3.')
  })
})
