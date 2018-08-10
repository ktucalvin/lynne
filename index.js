'use strict'
require('dotenv').config()
const { Client } = require('discord.js')
const { parse } = require('./parser')
const i18n = require('./i18n')
i18n.init()
const CustomError = require('./custom-error')
const commands = require('./command-registry')
const __ = i18n.translate
const _r = i18n.substitute

const client = new Client()
client.on('ready', () => {
  console.log('Mystia has woken up!')
})

client.on('message', message => {
  if (message.author.bot) { return }
  try {
    const { name, args } = parse(message.content)
    if (!name) { return }
    const command = commands.get(name) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(name))
    if (!command) {
      message.channel.send(__('main.commandNotFound', message.guild.id))
      return
    }
    command.execute(message, args)
  } catch (err) {
    if (!(err instanceof CustomError)) {
      console.error(err)
      message.channel.send(__('main.unknownError', message.guild.id))
    }
    if (err.type === 'ParserError') {
      message.channel.send(_r(err.key, err.data))
    }
  }
})

function close() {
  console.log('\nMystia is going to sleep!')
  i18n.saveServerLocalizations()
  client.destroy()
  process.exit(0)
}

process.on('SIGINT', close)
process.on('SIGTERM', close)

client.login(process.env.TOKEN)
