'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const VoiceChannel = require('$structures/FakeVoiceChannel')
const add = require('../add').execute
const expect = chai.expect
chai.use(require('chai-as-promised'))
chai.use(require('dirty-chai'))
chai.use(require('sinon-chai'))

describe('add', function () {
  let translate, message
  beforeEach(function () {
    message = new Message()
    message.member.voiceChannel = new VoiceChannel()
    translate = sinon.spy(i18n, 'translate')
  })
  afterEach(function () {
    translate.restore()
    message.member.voiceChannel._connection.dispatcher.emit('end')
  })

  it('notifies user of invalid URL', function () {
    add(message, ['theSong'])
    expect(translate).to.be.calledWith('add.invalidURL')
  })

  it('does nothing if not connected', function (done) {
    message.member.voiceChannel.join = () => Promise.resolve(null)
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      expect(translate).to.be.calledOnce() // called with only 'join.success'
      done()
    })
  })

  it('leaves the channel when finished playing', function (done) {
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      message.member.voiceChannel._connection.dispatcher.emit('end')
      expect(translate).to.be.calledWith('add.complete')
      done()
    })
  })

  it('plays a song', function (done) {
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      expect(translate).to.be.calledWith('add.success')
      done()
    })
  })

  it('logs playback errors', function (done) {
    const copy = console.log
    console.log = () => {}
    const spy = sinon.spy(console, 'log')
    message.member.voiceChannel._connection.playStream = () => { throw new Error() }
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      expect(spy).to.be.called()
      console.log = copy
      done()
    })
  })

  it('refuses to play if already playing a song', function (done) {
    add(message, ['https://www.youtube.com/watch?v=00000000000'])
    setTimeout(() => {
      add(message, ['https://www.youtube.com/watch?v=00000000000'])
      expect(translate).to.be.calledWith('add.alreadyPlaying')
      done()
    })
  })
})
