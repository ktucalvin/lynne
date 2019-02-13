'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const Member = require('$structures/FakeMember')
const ban = require('../ban').execute
const expect = chai.expect

const admin = new Member('0000')
admin.bannable = false
admin.user = { bot: false }
const user = new Member('0001')
user.user = { bot: false }

describe('ban', function () {
  let translate, banSpy, message
  beforeEach(function () {
    message = new Message()
    translate = sinon.spy(i18n, 'translate')
    banSpy = sinon.spy(user, 'ban')
    user.createDM = () => Promise.resolve({ send: () => {} })
  })
  afterEach(function () {
    translate.restore()
    banSpy.restore()
  })

  it('requires users be mentioned', function () {
    ban(message, [])
    expect(translate).to.be.calledWith('ban.noUsersMentioned')
  })

  it('bans the specified user', function () {
    message.mentions.members.set('0001', user)
    ban(message, ['<@user0001>'])
    expect(banSpy).to.be.called()
    expect(translate).to.be.calledWith('ban.successTitle')
  })

  it('adds a reason if given', function () {
    message.mentions.members.set('0000', admin)
    ban(message, ['<@admin0000>', '-r', 'This is the reason'])
    expect(translate).to.be.calledWith('ban.reasonTitle')
  })

  it('directly messages a user if a reason was provided', function () {
    message.mentions.members.set('0001', user)
    return Promise.resolve()
      .then(() => ban(message, ['<@user0001>', '-r', 'This is the reason']))
      .then(() => {
        expect(translate).to.be.calledWith('ban.DMExplanation')
      })
  })

  it('deletes a specified number of days of messages from the user', function () {
    message.mentions.members.set('0001', user)
    ban(message, ['<@user0001>', '-r', 'This is the reason', '-d', '5'])
    return Promise.resolve()
      .then(() => ban(message, ['<@user0001>', '-r', 'This is the reason', '-d', '5']))
      .then(() => {
        expect(banSpy).to.be.called()
        expect(banSpy).to.be.calledWith(sinon.match({ days: 5 }))
      })
  })

  it('rejects non-numeric number of days to delete', function () {
    message.mentions.members.set('0001', user)
    ban(message, ['<@user0001>', '-r', 'This is the reason', '-d', 'a string'])
    expect(translate).to.be.calledWith('ban.invalidNumberOfDays')
  })

  it('rejects negative number of days to delete', function () {
    message.mentions.members.set('0001', user)
    ban(message, ['<@user0001>', '-r', 'This is the reason', '-d', '-500'])
    expect(translate).to.be.calledWith('ban.invalidNumberOfDays')
  })

  it('still bans user even if DM failed to send', function () {
    message.mentions.members.set('0001', user)
    user.createDM = () => Promise.reject(new Error('purposeful crash'))
    return Promise.resolve()
      .then(() => ban(message, ['<@user0001>', '-r', 'This is the reason']))
      .catch(() => {
        expect(banSpy).to.be.called()
      })
  })

  it('does not ban admins', function () {
    message.mentions.members.set('0000', admin)
    ban(message, ['<@admin0000>'])
    expect(translate).to.be.calledWith('ban.failTitle')
  })

  it('does not DM if silent option is passed', function () {
    message.mentions.members.set('0001', user)
    return Promise.resolve()
      .then(() => ban(message, ['<@user0000>', '-s', '-r', 'This message should not be sent']))
      .then(() => {
        expect(banSpy).to.be.called()
        expect(translate).to.not.be.calledWith('ban.DMExplanation')
      })
  })

  it('does not attempt to DM bots', function () {
    user.user.bot = true
    message.mentions.members.set('0001', user)
    return Promise.resolve()
      .then(() => ban(message, ['<@user0000>', '-r', 'This message should not be sent']))
      .then(() => {
        expect(banSpy).to.be.called()
        expect(translate).to.not.be.calledWith('ban.DMExplanation')
        user.user.bot = false
      })
  })
})
