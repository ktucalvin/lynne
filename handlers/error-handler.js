'use strict'
const process = require('process')
const i18n = require('$lib/i18n')
const OperationalError = require('$structures/OperationalError')

module.exports = async function handleError (message, next) {
  if (message.author.bot) { return }
  try {
    await next()
  } catch (err) {
    if (err instanceof OperationalError) {
      if (err.key) message.channel.send(i18n.translate(err.key, message.guild.id, err.data))
    } else {
      console.error(`Terminating process due to non-user error while processing command`)
      console.error(err)
      console.log('\nMystia is going to sleep!')
      i18n.saveServerLocalizations()
      message.guild.me.client.destroy()
      process.exit(1)
    }
  }
}
