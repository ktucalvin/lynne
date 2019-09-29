'use strict'
/* eslint-env mocha */
require('module-alias/register')
require('$lib/chai-plugins')
const chai = require('chai')
const sinon = require('sinon')
const { Collection } = require('discord.js')
const i18n = require('$lib/i18n')
const Message = require('$structures/FakeMessage')
const User = require('$structures/FakeUser')
const unban = require('../unban').execute
const expect = chai.expect

const user = new User('0000')
const dupe = new User('0000')
dupe.discriminator = '0001'

describe('unban', function () {
  let translate, message, bans
  beforeEach(function () {
    message = new Message()
    bans = new Collection()
    message.guild.fetchBans = () => Promise.resolve(bans)
    translate = sinon.spy(i18n, 'translate')
  })
  afterEach(function () { translate.restore() })

  it('notifies if user could not be found due to not being banned', function () {
    return unban(message, ['member'])
      .then(() => expect(translate).to.be.calledWith('unban.userNotFound'))
  })

  it('notifies if user could not be found due to name', function () {
    bans.set('0000', user)
    return unban(message, ['member'])
      .then(() => expect(translate).to.be.calledWith('unban.userNotFound'))
  })

  it('notifies if user could not be found due to discriminator', function () {
    bans.set('0000', user)
    return unban(message, ['username:0000', '0001'])
      .then(() => expect(translate).to.be.calledWith('unban.userNotFound'))
  })

  it('unbans a user found by name only', function () {
    bans.set('0000', user)
    return unban(message, ['username:0000'])
      .then(() => expect(translate).to.be.calledWith('unban.success'))
  })

  it('unbans a user found by name and discriminator', function () {
    bans.set('0000', user)
    bans.set('0001', dupe)
    return unban(message, ['username:0000', '0000'])
      .then(() => expect(translate).to.be.calledWith('unban.success'))
  })

  it('notifies if multiple users found with same username', function () {
    bans.set('0000', user)
    bans.set('0001', dupe)
    return unban(message, ['username:0000'])
      .then(() => expect(translate).to.be.calledWith('unban.multipleUsersFound'))
  })

  it('recovers if unbanning threw error', function () {
    bans.set('0000', user)
    message.guild.unban = () => { throw new Error('purposeful crash') }
    return unban(message, ['username:0000'])
      .then(() => expect.fail('should have thrown error'))
      .catch(() => {}) // pass test
  })
})
