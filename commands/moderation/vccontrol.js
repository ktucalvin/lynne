'use strict'
const i18n = require('$lib/i18n')
const OperationalError = require('$structures/OperationalError')

function applyToAllMentions (message, fn) {
  for (const member of message.mentions.members.values()) {
    fn(member)
  }
  for (const role of message.mentions.roles.values()) {
    for (const member of role.members.values()) {
      fn(member)
    }
  }
}

module.exports = {
  name: 'vccontrol',
  aliases: ['vcc'],
  usage: [
    'vccontrol disconnect|dc @member',
    'vccontrol move|mv channel @member1 @role1 ...',
    'vccontrol [mute|deafen|unmute|undeafen|togglemute|toggledeaf|clear] @member1 @role1 ...',
    'vccontrol [m|d|um|ud|tm|td|c] @member1 @role1 ...'
  ],
  role: 'Moderator',
  execute (message, args) {
    const __ = i18n.useGuild(message.guild.id)
    switch (args[0]) {
      case 'dc':
      case 'disconnect': {
        const member = message.mentions.members.first()
        if (!member.voiceChannel) { return }
        return Promise.resolve()
          .then(() => message.guild.createChannel(`temp${member.id}`, 'voice'))
          .then(channel => member.setVoiceChannel(channel).then(() => channel))
          .then(channel => channel.delete())
          .catch(err => {
            console.log(err)
            throw new OperationalError('main.unknownError')
          })
      }
      case 'mv':
      case 'move': {
        const matches = message.guild.channels.filter(e => e.name === args[1])
        if (matches.size === 0) {
          message.channel.send(__('vccontrol.channelNotFound', args[1]))
        } else if (matches.size === 1) {
          applyToAllMentions(message, member => member.setVoiceChannel(matches.first()))
        } else {
          message.channel.send(__('vccontrol.multipleChannelsFound', args[1]))
        }
        break
      }
      case 'm':
      case 'mute':
        applyToAllMentions(message, member => member.setMute(true))
        break
      case 'd':
      case 'deafen':
        applyToAllMentions(message, member => member.setDeaf(true))
        break
      case 'um':
      case 'unmute':
        applyToAllMentions(message, member => member.setMute(false))
        break
      case 'ud':
      case 'undeafen':
        applyToAllMentions(message, member => member.setDeaf(false))
        break
      case 'tm':
      case 'togglemute':
        applyToAllMentions(message, member => member.setMute(!member.mute))
        break
      case 'td':
      case 'toggledeaf':
        applyToAllMentions(message, member => member.setDeaf(!member.deaf))
        break
      case 'c':
      case 'clear':
        applyToAllMentions(message, member => { member.setDeaf(false); member.setMute(false) })
        break
      default:
        message.channel.send(__('vccontrol.unrecognizedCommand'))
        break
    }
  }
}
