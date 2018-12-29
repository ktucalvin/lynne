'use strict'
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const manager = require('./QueueManager')
module.exports = {
  name: 'queue',
  usage: ['queue'],
  execute (message, args) {
    const { __ } = i18n.useGuild(message.guild.id)
    const Q = manager.get(message.guild.id)
    if (!Q || !Q.length) {
      message.channel.send(__('queue.notPlaying'))
      return
    }
    const embed = new RichEmbed()
      .setColor('#FD79A8')
      .setAuthor(__('queue.title'))
      .setDescription(Q.map((song, index) => `**${index + 1}.** ${song.title} (<${song.url}>)`).join('\n'))
      .setTimestamp()
    message.channel.send(embed)
  }
}
