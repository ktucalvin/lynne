'use strict'
const i18n = require('$lib/i18n')
const manager = require('./QueueManager')
module.exports = {
  name: 'skipto',
  usage: ['skipto index'],
  role: 'Music',
  execute (message, args) {
    const { __ } = i18n.useGuild(message.guild.id)
    const dispatcher = manager.getDispatcher(message.guild.id)
    const Q = manager.getQueue(message.guild.id)
    const index = parseInt(args[0])

    if (!Q || !Q.length) {
      message.channel.send(__('queue.notPlaying'))
      return
    }
    if (!args.length || !(typeof index === 'number' && index % 1 === 0)) {
      message.channel.send(__('skipto.invalidIndex'))
      return
    }
    if (index > Q.length || index < 1) {
      message.channel.send(__('skipto.indexOutOfBounds'))
      return
    }
    if (index === 1) {
      message.channel.send(__('skipto.cannotSkipCurrentSong'))
      return
    }

    // note dispatcher.end will cause the queue to shift one more time
    Q.splice(0, index - 2)
    dispatcher.end()
  }
}
