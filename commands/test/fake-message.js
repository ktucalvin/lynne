'use strict'
class Message {
  constructor() {
    this.channel = new Channel()
  }
}

class Channel {
  constructor() {
    this.send = msg => { return msg }
  }
}

module.exports = new Message()
