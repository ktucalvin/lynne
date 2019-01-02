'use strict'
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const manager = require('./QueueManager')

module.exports = {
  name: 'songinfo',
  usage: ['songinfo index'],
  aliases: ['sinfo'],
  execute (message, args) {
    const { __ } = i18n.useGuild(message.guild.id)
    const Q = manager.getQueue(message.guild.id)
    if (!Q || !Q.length) {
      message.channel.send(__('queue.notPlaying'))
      return
    }

    const index = parseInt(args[0])

    if (!args.length || !(typeof index === 'number' && index % 1 === 0)) {
      message.channel.send(__('songinfo.invalidIndex'))
      return
    }

    if (!Q[index - 1]) {
      message.channel.send(__('songinfo.indexOutOfBounds'))
      return
    }

    const metadata = Q[index - 1]
    if (metadata.secret) {
      message.channel.send(__('songinfo.secret'))
      return
    }
    const embed = new RichEmbed()
      .setColor('#FD79A8')
      .setTitle(metadata.title)
      .setURL(metadata.url)
      .setDescription(metadata.description.substr(0, 2048))
      .setAuthor(metadata.uploader, null, metadata.uploaderUrl)
      .setThumbnail(metadata.thumbnail)
      .addField(__('songinfo.field.tags'), metadata.tags || __('songinfo.noTags'))
      .addField(__('songinfo.field.views'), metadata.views, true)
      .addField(__('songinfo.field.duration'), metadata.duration, true)
      .addField(__('songinfo.field.uploadDate'), metadata.uploadDate, true)
      .addField(__('songinfo.field.likeInfo'), `${metadata.likes} : ${metadata.dislikes} (${metadata.ratio || 100}%)`, true)
      .setTimestamp()
    message.channel.send(embed)
  }
}
