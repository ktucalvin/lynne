'use strict'
const ytdl = require('ytdl-core')
const i18n = require('$lib/i18n')
const join = require('./join').execute
let playing = false

module.exports = {
  name: 'add',
  usage: ['add <song>'],
  execute (message, args) {
    const { __ } = i18n.useGuild(message.guild.id)
    if (playing) {
      message.channel.send(__('add.alreadyPlaying'))
      return
    }

    if (ytdl.validateURL(args[0])) {
      join(message).then(connection => {
        if (!connection) return
        playing = true
        message.channel.send(__('add.success'))
        const stream = ytdl(args[0], { filter: 'audioonly' })
        const dispatcher = connection.playStream(stream)
        dispatcher.on('end', () => {
          connection.channel.leave()
          message.channel.send(__('add.complete'))
          playing = false
        })
      }).catch(err => console.log(err))
    } else {
      message.channel.send(__('add.invalidURL'))
    }
  }
}
