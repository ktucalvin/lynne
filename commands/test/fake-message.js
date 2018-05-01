'use strict'
const User = require('./fake-user')

class Channel {
  constructor() {
    this.send = msg => { return msg }
  }
}

class Message {
  constructor() {
    this.channel = new Channel()
    this.author = new User('0000')
    this.mentions = {
      users: new Map()
    }
  }
}

module.exports = new Message()
