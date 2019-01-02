'use strict'
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const { getopts } = require('$lib/parser')
const manager = require('./QueueManager')
const songinfo = require('./songinfo').execute
const optmap = new Map()
  .set('detailed', { alias: 'd' })

module.exports = {
  name: 'playing',
  optmap,
  usage: ['playing'],
  execute (message, args) {
    const { __ } = i18n.useGuild(message.guild.id)
    const Q = manager.getQueue(message.guild.id)
    if (!Q || !Q.length) {
      message.channel.send(__('queue.notPlaying'))
      return
    }

    const detailed = getopts(args, optmap).get('flags').length

    if (detailed) {
      songinfo(message, ['1'])
    } else {
      const metadata = Q[0]
      if (metadata.secret) {
        message.channel.send(__('playing.secret'))
        return
      }
      const embed = new RichEmbed()
        .setColor('#FD79A8')
        .setTitle(metadata.title)
        .setDescription(metadata.uploader)
        .setURL(metadata.url)
        .setThumbnail(metadata.thumbnail)
        .setAuthor(__('playing.nowPlaying'))
        .setTimestamp()
      message.channel.send(embed)
    }
  }
}
