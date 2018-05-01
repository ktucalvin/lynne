'use strict'
module.exports = {
  name: 'avatar',
  description: 'Mystia fetches yours or someone else\'s profile picture!',
  usage: 'avatar [user]',
  execute(message, args) {
    if (args.length === 0) {
      message.channel.send(message.author.avatarURL)
    } else {
      let avatars = ''
      const users = message.mentions.users
      if (!users.size) {
        message.channel.send('Of whom did you want me to find the avatar of? Please @mention them!')
        return
      }
      for (const member of users.values()) {
        avatars += `**${member.username}**\n${member.avatarURL}\n`
      }
      message.channel.send(avatars)
    }
  }
}
