'use strict'
const User = require('./FakeUser')

class Channel {
  constructor() {
    this.sendPromise = false
    this.send = msg => {
      if (this.sendPromise === 'promise') { return Promise.resolve(new Message(msg)) }
      return msg
    }
  }

  setSendType(type) {
    this.sendPromise = type
  }
}

class Message {
  constructor(msg) {
    this.content = msg
    this.channel = new Channel()
    this.author = new User('0000')
    this.member = new User('0000')
    this.guild = {
      id: '0000'
    }
    this.mentions = {
      users: new Map()
    }
  }
}

module.exports = new Message()
