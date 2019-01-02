'use strict'
const manager = require('./QueueManager')
module.exports = {
  name: 'play',
  usage: ['play'],
  execute (message, args) {
    const dispatcher = manager.getDispatcher(message.guild.id)
    if (dispatcher) { dispatcher.resume() }
  }
}
