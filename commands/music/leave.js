'use strict'
module.exports = {
  name: 'leave',
  usage: ['leave'],
  execute (message, args) {
    if (message.guild.me.voiceChannel) {
      message.guild.me.voiceChannel.leave()
    }
  }
}
