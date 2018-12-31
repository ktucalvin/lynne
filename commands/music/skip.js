'use strict'
const manager = require('./QueueManager')
module.exports = {
  name: 'skip',
  usage: ['skip'],
  aliases: ['next'],
  execute (message, args) {
    const dispatcher = manager.getDispatcher(message.guild.id)
    if (dispatcher) { dispatcher.end() }
  }
}
