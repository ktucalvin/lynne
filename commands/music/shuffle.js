'use strict'
const i18n = require('$lib/i18n')
const manager = require('./QueueManager')
module.exports = {
  name: 'shuffle',
  usage: ['shuffle'],
  role: 'Music',
  execute (message, args) {
    const __ = i18n.useGuild(message.guild.id)
    let Q = manager.getQueue(message.guild.id)
    if (!Q || !Q.length) {
      message.channel.send(__('queue.notPlaying'))
      return
    }
    Q.splice(1, Q.length, ...Q.slice(1).sort(() => 0.5 - Math.random()))
    message.channel.send(__('shuffle.success'))
  }
}
