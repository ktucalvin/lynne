'use strict'
require('dotenv').config()
require('module-alias/register')
const { Client } = require('discord.js')
const { parse } = require('$lib/parser')
const i18n = require('$lib/i18n')
const OperationalError = require('$structures/OperationalError')
const registry = require('$lib/registry')

const client = new Client()
client.on('ready', () => {
  console.log('Mystia has woken up!')
})

client.on('message', message => {
  if (message.author.bot) { return }
  const { __ } = i18n.useGuild(message.guild.id)
  try {
    const { name, args } = parse(message.content)
    if (!name) { return }
    const command = registry.fetch(name)
    const permissions = message.member.permissions

    if (!command) { message.channel.send(__('main.commandNotFound')); return }
    if (command.permission && !permissions.has(command.permission)) {
      message.channel.send(__('main.insufficientPermission'))
      return
    }

    Promise.resolve()
      .then(() => command.execute(message, args))
      .catch(err => handleError(message, err))
  } catch (err) {
    handleError(err)
  }
})

function handleError (message, err) {
  if (err instanceof OperationalError) {
    if (err.key) message.channel.send(i18n.substitute(err.key, err.data, message.guild.id))
  } else {
    console.error(`Terminating process due to non-user error while processing command`)
    console.error(err)
    close(1)
  }
}

function close (status) {
  console.log('\nMystia is going to sleep!')
  i18n.saveServerLocalizations()
  client.destroy()
  process.exit(status || 0)
}

process.on('SIGINT', close)
process.on('SIGTERM', close)

client.login(process.env.TOKEN)
