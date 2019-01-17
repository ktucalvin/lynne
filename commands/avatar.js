'use strict'
const i18n = require('$lib/i18n')

module.exports = {
  name: 'avatar',
  usage: ['avatar [user]'],
  execute (message, args) {
    const __ = i18n.useGuild(message.guild.id)
    if (args.length === 0) {
      message.channel.send(message.author.avatarURL)
    } else {
      let avatars = ''
      const users = message.mentions.users
      if (!users.size) { message.channel.send(__('avatar.noMentionedUsers')); return }
      for (const member of users.values()) {
        avatars += `**${member.username}**\n${member.avatarURL}\n`
      }
      message.channel.send(avatars)
    }
  }
}
