'use strict'
/* eslint-env mocha */
const expect = require('chai').expect
const sinon = require('sinon')
const message = require('./fake-message')
const User = require('./fake-user')
const avatar = require('../avatar').execute
let spy
describe('avatar', function() {
  beforeEach(function() {
    spy = sinon.spy(message.channel, 'send')
  })

  afterEach(function() {
    spy.restore()
    message.mentions.users = new Map()
  })

  it('should print the avatar of the author given no arguments', function() {
    avatar(message, [])
    expect(spy.returnValues[0]).to.include('avatarURL:0000')
  })

  it('should print the avatar of a mentioned user', function() {
    message.mentions.users.set('0001', new User('0001'))
    avatar(message, ['@test0001'])
    expect(spy.returnValues[0]).to.include('avatarURL:0001')
  })

  it('should print multiple avatars if multiple users are mentioned', function() {
    message.mentions.users.set('0001', new User('0001'))
    message.mentions.users.set('0002', new User('0002'))
    avatar(message, ['@test001', 'dummy-argument', '@test0002'])
    expect(spy.returnValues[0]).to.include('avatarURL:0001').and.to.include('avatarURL:0002')
  })

  it('should ask for user if argument given but no mention found', function() {
    avatar(message, ['dummy-argument'])
    expect(spy.returnValues[0]).to.include('Please @mention them!')
  })
})
