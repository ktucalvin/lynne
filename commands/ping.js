'use strict'
module.exports = {
  name: 'ping',
  description: 'Mystia replies with pong!',
  usage: 'ping',
  execute(message, args) {
    message.channel.send('pong!')
  }
}
