'use strict'
const manager = require('./QueueManager')
module.exports = {
  name: 'pause',
  usage: ['pause'],
  execute (message, args) {
    const dispatcher = manager.getDispatcher(message.guild.id)
    if (dispatcher) { dispatcher.pause() }
  }
}
