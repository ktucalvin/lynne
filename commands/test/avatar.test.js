'use strict'
/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const sinon = require('sinon')
const message = require('./fake-message')
const User = require('./fake-user')
const i18n = require('../../i18n')
const avatar = require('../avatar').execute
let spy

describe('avatar', function() {
  before(function() { i18n.init() })
  beforeEach(function() {
    spy = sinon.spy(message.channel, 'send')
  })

  afterEach(function() {
    spy.restore()
    message.mentions.users = new Map()
  })

  it('should print the avatar of the author given no arguments', function() {
    avatar(message, [])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').include('avatarURL:0000')
  })

  it('should print the avatar of a mentioned user', function() {
    message.mentions.users.set('0001', new User('0001'))
    avatar(message, ['@test0001'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').include('avatarURL:0001')
  })

  it('should print multiple avatars if multiple users are mentioned', function() {
    message.mentions.users.set('0001', new User('0001'))
    message.mentions.users.set('0002', new User('0002'))
    avatar(message, ['@test001', 'dummy-argument', '@test0002'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content')
      .include('avatarURL:0001')
      .and.to.include('avatarURL:0002')
  })

  it('should ask for user if argument given but no mention found', function() {
    avatar(message, ['dummy-argument'])
    return expect(spy.returnValues[0]).to.eventually.have.property('content').include('Please @mention them!')
  })
})
