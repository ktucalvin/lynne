'use strict'
const ytdl = require('ytdl-core')
const i18n = require('$lib/i18n')
const { getopts } = require('$lib/parser')
const OperationalError = require('$structures/OperationalError')
const manager = require('./QueueManager')
const join = require('./join').execute
const optmap = new Map()
  .set('secret', { alias: 's' })
let playing

function play (message) {
  const queue = manager.getQueue(message.guild.id)
  if (!queue || !queue.length || playing) { return }
  // If we lose connection, we can't recover so just clean up
  if (!message.guild.me.voiceChannel) {
    manager.flush(message.guild.id)
    message.channel.send(i18n.translate('add.lostConnection', message.guild.id))
    return
  }
  playing = true
  const url = queue[0].url
  const connection = message.guild.me.voiceChannel.connection
  const stream = ytdl(url, { quality: 'highestaudio' })
  const dispatcher = connection.playStream(stream)
  manager.attachDispatcher(dispatcher, message.guild.id)
  dispatcher.on('end', () => {
    queue.shift()
    playing = false
    if (queue.length) {
      play(message)
    } else {
      message.channel.send(i18n.translate('add.complete', message.guild.id))
      connection.channel.leave()
    }
  })
}

module.exports = {
  name: 'add',
  optmap,
  usage: ['add <song>'],
  role: 'Music',
  execute (message, args) {
    const __ = i18n.useGuild(message.guild.id)
    const secret = getopts(args, optmap).get('flags').length
    let url = args[0]
    if (!args.length) { message.channel.send(__('add.insufficientArgs')); return }
    if (!ytdl.validateURL(url)) { message.channel.send(__('add.invalidURL')); return }
    url = `https://www.youtube.com/watch?v=${ytdl.getURLVideoID(url)}`

    return (message.guild.me.voiceChannel ? Promise.resolve() : join(message))
      .then(() => manager.add(url, message.guild.id, secret))
      .then(song => {
        if (!song.secret) message.channel.send(__('add.success', song.title))
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
