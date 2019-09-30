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
    const __ = i18n.useGuild(message.guild.id)
    const queue = manager.getQueue(message.guild.id)
    const index = parseInt(args[0])

    if (!queue || !queue.length) {
      message.channel.send(__('queue.notPlaying'))
      return
    }
    if (!args.length || !(typeof index === 'number' && index % 1 === 0)) {
      message.channel.send(__('qremove.invalidIndex'))
      return
    }
    if (index > queue.length || index < 1) {
      message.channel.send(__('qremove.indexOutOfBounds'))
      return
    }
    if (index === 1) {
      skip(message, [])
      return
    }

    const song = queue[index - 1]
    queue.splice(index - 1, 1)
    message.channel.send(__('qremove.success', song.title))
  }
}
