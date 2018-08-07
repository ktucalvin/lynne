'use strict'
module.exports = {
  name: 'ping',
  description: 'ping.description',
  usage: 'ping',
  execute(message, args) {
    message.channel.send('pong!')
  }
}
