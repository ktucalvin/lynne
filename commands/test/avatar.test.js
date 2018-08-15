'use strict'
/* eslint-env mocha */
require('module-alias/register')
const chai = require('chai')
const sinon = require('sinon')
const i18n = require('$lib/i18n')
const message = require('$structures/FakeMessage')
const User = require('$structures/FakeUser')
const avatar = require('../avatar').execute
const expect = chai.expect
chai.use(require('sinon-chai'))

describe('avatar', function() {
  let spy
  before(function() { i18n.init() })
  beforeEach(function() { spy = sinon.spy(message.channel, 'send') })
  afterEach(function() {
    spy.restore()
    message.mentions.users = new Map()
  })

  it('prints the author\'s avatar given no arguments', function() {
    avatar(message, [])
    expect(spy).to.be.calledWith('avatarURL:0000')
  })

  it('prints a mentioned user\'s avatar', function() {
    message.mentions.users.set('0001', new User('0001'))
    avatar(message, ['@test0001'])
    expect(spy.returnValues[0]).to.include('avatarURL:0001')
  })

  it('prints multiple mentioned users\' avatars', function() {
    message.mentions.users.set('0001', new User('0001'))
    message.mentions.users.set('0002', new User('0002'))
    avatar(message, ['@test001', 'dummy-argument', '@test0002'])
    expect(spy.returnValues[0]).to
      .include('avatarURL:0001')
      .and.to.include('avatarURL:0002')
  })

  it('asks for user if argument given but no mention found', function() {
    const translateSpy = sinon.spy(i18n, 'translate')
    avatar(message, ['dummy-argument'])
    expect(translateSpy).to.be.calledWith('avatar.noMentionedUsers')
    translateSpy.restore()
  })
})
