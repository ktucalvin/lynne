'use strict'
const manager = require('./QueueManager')
module.exports = {
  name: 'leave',
  usage: ['leave'],
  execute (message, args) {
    if (message.guild.me.voiceChannel) {
      manager.flush(message.guild.id)
      message.guild.me.voiceChannel.leave()
    }
  }
}
