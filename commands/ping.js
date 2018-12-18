'use strict'
module.exports = {
  name: 'ping',
  usage: ['ping'],
  execute (message, args) {
    message.channel.send('pong!')
  }
}
