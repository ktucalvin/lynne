'use strict'
const ytdl = require('ytdl-core')
const i18n = require('$lib/i18n')
const OperationalError = require('$structures/OperationalError')
const manager = require('./QueueManager')
const join = require('./join').execute
let playing

function play (message) {
  const Q = manager.get(message.guild.id)
  if (!Q || !Q.length || playing) { return }
  playing = true
  const url = Q[0].url
  const connection = message.guild.me.voiceChannel.connection
  const stream = ytdl(url, { quality: 'highestaudio' })
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
    const { __, _s } = i18n.useGuild(message.guild.id)
    const url = args[0]
    if (!args.length) { message.channel.send(__('add.insufficientArgs')); return }
    if (!ytdl.validateURL(url)) { message.channel.send(__('add.invalidURL')); return }

    return (message.guild.me.voiceChannel ? Promise.resolve() : join(message))
      .then(() => manager.add(url, message.guild.id))
      .then(song => {
        message.channel.send(_s('add.success', song.title))
        play(message)
      })
      .catch(err => {
        if (!(err instanceof OperationalError)) {
          message.channel.send(__('main.unknownError'))
          console.log(err)
        }
      })
  }
}
