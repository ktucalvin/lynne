'use strict'
module.exports = new function() {
  const __ = require('../i18n').translate
  this.name = 'avatar'
  this.description = 'avatar.description'
  this.usage = 'avatar [user]'
  this.execute = (message, args) => {
    if (args.length === 0) {
      message.channel.send(message.author.avatarURL)
    } else {
      let avatars = ''
      const users = message.mentions.users
      if (!users.size) {
        message.channel.send(__('avatar.noMentionedUsers'))
        return
      }
      for (const member of users.values()) {
        avatars += `**${member.username}**\n${member.avatarURL}\n`
      }
      message.channel.send(avatars)
    }
  }
}()
