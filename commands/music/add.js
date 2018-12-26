'use strict'
const ytdl = require('ytdl-core')
const i18n = require('$lib/i18n')
const manager = require('./QueueManager')
const join = require('./join').execute
let playing

function play (message) {
  if (!message.guild.me.voiceChannel) {
    join(message).then(connection => { if (connection) play(message) }).catch(err => console.log(err))
    return
  }
  const Q = manager.get(message.guild.id)
  if (!Q || !Q.length || playing) { return }
  playing = true
  const url = Q[0]
  const connection = message.guild.me.voiceChannel.connection
  const stream = ytdl(url, { filter: 'audioonly' })
  const dispatcher = connection.playStream(stream)
  dispatcher.on('end', () => {
    Q.shift()
    playing = false
    if (Q.length) {
      play(message)
    } else {
      message.channel.send(i18n.translate('add.complete', message.guild.id))
      connection.channel.leave()
    }
  })
}

module.exports = {
  name: 'add',
  usage: ['add <song>'],
  execute (message, args) {
    const { __ } = i18n.useGuild(message.guild.id)
    const url = args[0]
    if (!args.length) { message.channel.send(__('add.insufficientArgs')); return }
    if (!ytdl.validateURL(url)) { message.channel.send(__('add.invalidURL')); return }

    if (message.member.voiceChannel) {
      manager.add(url, message.guild.id)
    }
    play(message)
  }
}
