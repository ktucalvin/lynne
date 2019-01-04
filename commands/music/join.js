'use strict'
const i18n = require('$lib/i18n')
const OperationalError = require('$structures/OperationalError')

module.exports = {
  name: 'join',
  usage: ['join'],
  role: 'Music',
  execute (message, args) {
    const { __, _s } = i18n.useGuild(message.guild.id)
    const channel = message.member.voiceChannel
    if (channel) {
      return channel.join()
        .then(c => {
          message.channel.send(_s('join.success', { channel: channel.name }))
          return c
        })
    } else {
      message.channel.send(__('join.noVoiceChannel'))
      return Promise.reject(new OperationalError())
    }
  }
}
