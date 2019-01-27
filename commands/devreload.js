'use strict'
const i18n = require('$lib/i18n')
let registry

module.exports = {
  name: 'devreload',
  usage: ['devreload'],
  aliases: ['devrel'],
  permission: 'ADMINISTRATOR',
  execute (message, args) {
    if (!registry) registry = require('$lib/registry')
    registry.reload()
    message.channel.send(i18n.translate('devreload.done', message.guild.id))
  }
}
