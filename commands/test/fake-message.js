'use strict'
const User = require('./fake-user')

class Channel {
  constructor() {
    this.send = msg => Promise.resolve(new Message(msg))
  }
}

class Message {
  constructor(msg) {
    this.content = msg
    this.channel = new Channel()
    this.author = new User('0000')
    this.mentions = {
      users: new Map()
    }
  }
}

module.exports = new Message()
