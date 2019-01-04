'use strict'
const i18n = require('$lib/i18n')
const manager = require('./QueueManager')
const skip = require('./skip').execute
module.exports = {
  name: 'qremove',
  usage: ['qremove index'],
  aliases: ['qrem'],
  role: 'Music',
  execute (message, args) {
    const { __, _s } = i18n.useGuild(message.guild.id)
    const Q = manager.getQueue(message.guild.id)
    const index = parseInt(args[0])

    if (!Q || !Q.length) {
      message.channel.send(__('queue.notPlaying'))
      return
    }
    if (!args.length || !(typeof index === 'number' && index % 1 === 0)) {
      message.channel.send(__('qremove.invalidIndex'))
      return
    }
    if (index > Q.length || index < 1) {
      message.channel.send(__('qremove.indexOutOfBounds'))
      return
    }
    if (index === 1) {
      skip(message, [])
      return
    }

    const song = Q[index - 1]
    Q.splice(index - 1, 1)
    message.channel.send(_s('qremove.success', song.title))
  }
}
