'use strict'
const i18n = require('$lib/i18n')
const OperationalError = require('$structures/OperationalError')

module.exports = {
  name: 'unban',
  aliases: ['pardon'],
  usage: ['unban username [discriminator]'],
  permission: 'BAN_MEMBERS',
  execute (message, args) {
    const __ = i18n.useGuild(message.guild.id)
    return message.guild.fetchBans()
      .then(bans => {
        const matches = bans.filter(e => e.username === args[0] && (args[1] ? e.discriminator === args[1] : true))
        if (matches.size === 0) {
          message.channel.send(__('unban.userNotFound'))
        } else if (matches.size === 1) {
          message.guild.unban(matches.first())
          message.channel.send(__('unban.success', args[0]))
        } else {
          message.channel.send(__('unban.multipleUsersFound'))
        }
      })
      .catch(e => {
        console.log(e)
        throw new OperationalError('main.unknownError')
      })
  }
}
