'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const manager = require('../QueueManager')
const shuffle = require('../shuffle').execute
const expect = chai.expect
chai.use(require('sinon-chai'))
chai.use(require('dirty-chai'))

describe('shuffle', function () {
  let spy, message
  beforeEach(function () {
    message = new Message()
    spy = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { spy.restore() })
  after(function () { manager.flush(message.guild.id) })

  it('notifies user nothing is playing when queue is empty', function () {
    shuffle(message, [])
    expect(spy).to.be.calledWith('queue.notPlaying')
  })

  it('shuffles the queue except for the playing song', function () {
    const pre = '1234567890'.split('')
    manager._inject({ queue: pre.slice(0) }, message.guild.id)
    shuffle(message, [])
    const post = manager.getQueue(message.guild.id)
    expect(post.length).to.equal(pre.length)
    expect(post[0]).to.equal(pre[0])
    expect(post, 'queue remained in the same order').to.satisfy(post => {
      for (let i = 1; i < post.length; i++) {
        if (post[i] !== pre[i]) return true
      }
    })
  })
})
