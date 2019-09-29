'use strict'
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const { getopts } = require('$lib/parser')
const optmap = new Map()
  .set('reason', { alias: 'r', hasParam: true })
  .set('silent', { alias: 's' })

module.exports = {
  name: 'kick',
  optmap,
  usage: ['kick @user1 @user2 ...'],
  permission: 'KICK_MEMBERS',
  execute (message, args) {
    const __ = i18n.useGuild(message.guild.id)
    if (!message.mentions.members.size) {
      message.channel.send(__('kick.noUsersMentioned'))
      return
    }

    const opts = getopts(args, optmap)
    const reason = opts.get('reason')
    const silent = opts.get('flags').length
    const kicked = []
    const unkicked = []
    for (const member of message.mentions.members.values()) {
      if (member.kickable) {
        kicked.push(member.displayName)
        if (!member.user.bot && !silent && reason) {
          member.createDM()
            .then(channel => channel.send(__('kick.DMExplanation', { name: message.guild.name, reason })))
            .then(() => member.kick(reason))
            .catch(e => {
              console.log(e)
              member.kick(reason)
            })
        } else {
          member.kick(reason)
        }
      } else {
        unkicked.push(member.displayName)
      }
    }

    const embed = new RichEmbed()
      .setColor('#FD79A8')
    if (reason) embed.addField(__('kick.reasonTitle'), reason)
    if (kicked.length) embed.addField(__('kick.successTitle'), kicked.join(', '))
    if (unkicked.length) embed.addField(__('kick.failTitle'), unkicked.join(', '))
    if (!silent) { message.channel.send(embed) }
  }
}
