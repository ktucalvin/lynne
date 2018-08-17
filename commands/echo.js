'use strict'
module.exports = {
  name: 'echo',
  aliases: ['say'],
  usage: ['echo [string]'],
  execute(message, args) {
    if (!args.length) {
      message.channel.send('_ _') // send blank line
      return
    }
    message.channel.send(args.join(' '))
  }
}
