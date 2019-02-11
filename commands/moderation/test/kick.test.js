'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const Member = require('$structures/FakeMember')
const kick = require('../kick').execute
const expect = chai.expect

const admin = new Member('0000')
admin.kickable = false
admin.user = { bot: false }
const user = new Member('0001')
user.user = { bot: false }

describe('kick', function () {
  let translate, kickSpy, message
  beforeEach(function () {
    message = new Message()
    translate = sinon.spy(i18n, 'translate')
    kickSpy = sinon.spy(user, 'kick')
    user.createDM = () => Promise.resolve({ send: () => {} })
  })
  afterEach(function () {
    translate.restore()
    kickSpy.restore()
  })

  it('requires users be mentioned', function () {
    kick(message, [])
    expect(translate).to.be.calledWith('kick.noUsersMentioned')
  })

  it('kicks the specified user', function () {
    message.mentions.members.set('0001', user)
    kick(message, ['<@user0001>'])
    expect(kickSpy).to.be.called()
    expect(translate).to.be.calledWith('kick.successTitle')
  })

  it('adds a reason if given', function () {
    message.mentions.members.set('0000', admin)
    kick(message, ['<@admin0000>', '-r', 'This is the reason'])
    expect(translate).to.be.calledWith('kick.reasonTitle')
  })

  it('directly messages a user if a reason was provided', function () {
    message.mentions.members.set('0001', user)
    return Promise.resolve()
      .then(() => kick(message, ['<@user0001>', '-r', 'This is the reason']))
      .then(() => {
        expect(translate).to.be.calledWith('kick.DMExplanation')
      })
  })

  it('still kicks user even if DM failed to send', function () {
    message.mentions.members.set('0001', user)
    user.createDM = () => Promise.reject(new Error('purposeful crash'))
    return Promise.resolve()
      .then(() => kick(message, ['<@user0001>', '-r', 'This is the reason']))
      .catch(() => {
        expect(kickSpy).to.be.called()
      })
  })

  it('does not kick admins', function () {
    message.mentions.members.set('0000', admin)
    kick(message, ['<@admin0000>'])
    expect(translate).to.be.calledWith('kick.failTitle')
  })

  it('does not DM if silent option is passed', function () {
    message.mentions.members.set('0001', user)
    return Promise.resolve()
      .then(() => kick(message, ['<@user0000>', '-s', '-r', 'This message should not be sent']))
      .then(() => {
        expect(kickSpy).to.be.called()
        expect(translate).to.not.be.calledWith('kick.DMExplanation')
      })
  })

  it('does not attempt to DM bots', function () {
    user.user.bot = true
    message.mentions.members.set('0001', user)
    return Promise.resolve()
      .then(() => kick(message, ['<@user0000>', '-r', 'This message should not be sent']))
      .then(() => {
        expect(kickSpy).to.be.called()
        expect(translate).to.not.be.calledWith('kick.DMExplanation')
        user.user.bot = false
      })
  })
})
