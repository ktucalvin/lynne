'use strict'
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const { getopts } = require('$lib/parser')
const optmap = new Map()
  .set('days', { alias: 'd', hasParam: true })
  .set('reason', { alias: 'r', hasParam: true })
  .set('silent', { alias: 's' })

module.exports = {
  name: 'ban',
  optmap,
  usage: ['ban @user1 @user2 ...'],
  permission: 'BAN_MEMBERS',
  execute (message, args) {
    const __ = i18n.useGuild(message.guild.id)
    if (!message.mentions.members.size) {
      message.channel.send(__('ban.noUsersMentioned'))
      return
    }

    const opts = getopts(args, optmap)
    const reason = opts.get('reason')
    const days = parseInt(opts.get('days'))
    const silent = opts.get('flags').length
    const banned = []
    const unbanned = []

    if (opts.get('days') && !(typeof days === 'number' && days % 1 === 0 && days > 0)) {
      message.channel.send(__('ban.invalidNumberOfDays'))
      return
    }

    for (const member of message.mentions.members.values()) {
      if (member.bannable) {
        banned.push(member.displayName)
        if (!member.user.bot && !silent && reason) {
          member.createDM()
            .then(channel => channel.send(__('ban.DMExplanation', { name: message.guild.name, reason })))
            .then(() => member.ban({ reason, days }))
            .catch(e => {
              console.log(e)
              member.ban({ reason, days })
            })
        } else {
          member.ban({ reason, days })
        }
      } else {
        unbanned.push(member.displayName)
      }
    }

    const embed = new RichEmbed()
      .setColor('#FD79A8')
    if (reason) embed.addField(__('ban.reasonTitle'), reason)
    if (banned.length) embed.addField(__('ban.successTitle'), banned.join(', '))
    if (unbanned.length) embed.addField(__('ban.failTitle'), unbanned.join(', '))
    if (!silent) { message.channel.send(embed) }
  }
}
