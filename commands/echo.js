'use strict'
module.exports = {
  name: 'echo',
  aliases: ['say'],
  description: 'Mystia echoes what you say!',
  usage: 'echo <message>',
  execute(message, args) {
    if (!args.length) {
      message.channel.send('_ _') // send blank line
      return
    }
    message.channel.send(args.join(' '))
  }
}