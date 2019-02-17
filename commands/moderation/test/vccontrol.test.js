'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const { Collection } = require('discord.js')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const Member = require('$structures/FakeMember')
const vcc = require('../vccontrol').execute
const expect = chai.expect

describe('vccontrol', function () {
  let first, second
  let translate, message
  beforeEach(function () {
    message = new Message()
    first = new Member('0000')
    second = new Member('0001')
    message.mentions.members.set('0000', first)
    message.mentions.members.set('0001', second)
    translate = sinon.spy(i18n, 'translate')
  })

  afterEach(function () { translate.restore() })

  it('mutes mentioned members when passed "mute"', function () {
    vcc(message, ['mute', '<@user0000>', '<@user0001>'])
    expect(first.mute).to.equal(true)
    expect(second.mute).to.equal(true)
  })

  it('mutes mentioned members when passed "m"', function () {
    vcc(message, ['m', '<@user0000>', '<@user0001>'])
    expect(first.mute).to.equal(true)
    expect(second.mute).to.equal(true)
  })

  it('deafens mentioned members when passed "deafen"', function () {
    vcc(message, ['deafen', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(true)
    expect(second.deaf).to.equal(true)
  })

  it('deafens mentioned members when passed "d"', function () {
    vcc(message, ['d', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(true)
    expect(second.deaf).to.equal(true)
  })

  it('unmutes mentioned members when passed "unmute"', function () {
    first.mute = true
    second.mute = true
    vcc(message, ['unmute', '<@user0000>', '<@user0001>'])
    expect(first.mute).to.equal(false)
    expect(second.mute).to.equal(false)
  })

  it('unmutes mentioned members when passed "um"', function () {
    first.mute = true
    second.mute = true
    vcc(message, ['um', '<@user0000>', '<@user0001>'])
    expect(first.mute).to.equal(false)
    expect(second.mute).to.equal(false)
  })

  it('undeafens mentioned members when passed "undeafen"', function () {
    first.deaf = true
    second.deaf = true
    vcc(message, ['undeafen', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(false)
    expect(second.deaf).to.equal(false)
  })

  it('undeafens mentioned members when passed "ud"', function () {
    first.deaf = true
    second.deaf = true
    vcc(message, ['ud', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(false)
    expect(second.deaf).to.equal(false)
  })

  it('toggles muteness of mentioned members when passed "togglemute"', function () {
    vcc(message, ['togglemute', '<@user0000>', '<@user0001>'])
    expect(first.mute).to.equal(true)
    expect(second.mute).to.equal(true)
    vcc(message, ['togglemute', '<@user0000>', '<@user0001>'])
    expect(first.mute).to.equal(false)
    expect(second.mute).to.equal(false)
  })

  it('toggles muteness of mentioned members when passed "tm"', function () {
    vcc(message, ['tm', '<@user0000>', '<@user0001>'])
    expect(first.mute).to.equal(true)
    expect(second.mute).to.equal(true)
    vcc(message, ['tm', '<@user0000>', '<@user0001>'])
    expect(first.mute).to.equal(false)
    expect(second.mute).to.equal(false)
  })

  it('toggles deafness of mentioned members when passed "toggledeaf"', function () {
    vcc(message, ['toggledeaf', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(true)
    expect(second.deaf).to.equal(true)
    vcc(message, ['toggledeaf', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(false)
    expect(second.deaf).to.equal(false)
  })

  it('toggles deafness of mentioned members when passed "td"', function () {
    vcc(message, ['td', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(true)
    expect(second.deaf).to.equal(true)
    vcc(message, ['td', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(false)
    expect(second.deaf).to.equal(false)
  })

  it('clears mute and deaf status of mentioned members when passed "clear"', function () {
    first.deaf = true
    first.mute = true
    second.deaf = true
    second.mute = true
    vcc(message, ['clear', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(false)
    expect(first.mute).to.equal(false)
    expect(second.deaf).to.equal(false)
    expect(second.mute).to.equal(false)
  })

  it('clears mute and deaf status of mentioned members when passed "c"', function () {
    first.deaf = true
    first.mute = true
    second.deaf = true
    second.mute = true
    vcc(message, ['c', '<@user0000>', '<@user0001>'])
    expect(first.deaf).to.equal(false)
    expect(first.mute).to.equal(false)
    expect(second.deaf).to.equal(false)
    expect(second.mute).to.equal(false)
  })

  it('notifies user if subcommand is not recognized', function () {
    vcc(message, ['unrecognizable_subcommand'])
    expect(translate).to.be.calledWith('vccontrol.unrecognizedCommand')
  })

  // Since all subcommands except disconnect rely on applyToAllMentions,
  // test only deafen
  it('operates on roles', function () {
    const member1 = new Member('M1')
    const member2 = new Member('M2')
    const members = new Collection()
      .set('M1', member1)
      .set('M2', member2)
    const role = { members }
    message.mentions.roles.set('r000', role)
    message.mentions.members = new Collection()
    vcc(message, ['deafen', '<@role>'])
    expect(member1.deaf).to.equal(true)
    expect(member2.deaf).to.equal(true)
  })

  // ===== Disconnect subcommand
  describe('disconnect', function () {
    let channel
    beforeEach(function () {
      channel = { delete: sinon.spy() }
      message.guild.createChannel = () => Promise.resolve(channel)
      first.setVoiceChannel = () => Promise.resolve()
      first.voiceChannel = true
    })
    it('disconnects member when passed "disconnect"', function () {
      return vcc(message, ['disconnect', '<@user0000>'])
        .then(() => {
          expect(channel.delete).to.be.called()
        })
    })

    it('disconnects member when passed "dc"', function () {
      return vcc(message, ['dc', '<@user0000>'])
        .then(() => {
          expect(channel.delete).to.be.called()
        })
    })

    it('does not attempt to disconnect member without voice channel', function () {
      first.voiceChannel = false
      return Promise.resolve()
        .then(() => vcc(message, ['dc', '<@user0000>']))
        .then(() => expect(channel.delete).to.not.be.called())
    })

    it('recovers from errors when disconnecting member', function () {
      first.setVoiceChannel = () => { throw new Error('purposeful crash') }
      return vcc(message, ['dc', '<@user0000>'])
        .then(() => expect.fail('should have thrown error'))
        .catch(() => {})
    })
  })

  // ===== Move subcommand
  describe('move', function () {
    beforeEach(function () {
      message.guild.channels.set('0000', { name: 'zeroChannel' })
    })

    it('notifies user if no voice channel could be found with name', function () {
      vcc(message, ['mv', 'nonexistent channel'])
      vcc(message, ['move', 'nonexistent channel'])
      expect(translate).to.be.calledTwice()
      expect(translate).to.always.be.calledWith('vccontrol.channelNotFound')
    })

    it('moves members to unique specified voice channel', function () {
      const spy = first.setVoiceChannel = sinon.spy()
      vcc(message, ['mv', 'zeroChannel'])
      expect(spy).to.be.calledWith({ name: 'zeroChannel' })
    })

    it('notifies user if multiple channels were found', function () {
      message.guild.channels.set('0002', { name: 'zeroChannel' })
      vcc(message, ['mv', 'zeroChannel'])
      vcc(message, ['move', 'zeroChannel'])
      expect(translate).to.be.calledTwice()
      expect(translate).to.always.be.calledWith('vccontrol.multipleChannelsFound')
    })
  })
})
