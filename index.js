'use strict'
require('dotenv').config()
require('module-alias/register')
const { Client } = require('discord.js')
const { parse } = require('$lib/parser')
const i18n = require('$lib/i18n')
const CustomError = require('$structures/CustomError')
const commands = require('$lib/registry')

const client = new Client()
client.on('ready', () => {
  console.log('Mystia has woken up!')
})

client.on('message', message => {
  if (message.author.bot) { return }
  const { __, _s } = i18n.useGuild(message.guild.id)
  try {
    const { name, args } = parse(message.content)
    if (!name) { return }
    const command = commands.get(name) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(name))
    const permissions = message.member.permissions

    if (!command) { message.channel.send(__('main.commandNotFound')); return }
    if (command.permission && !permissions.has(command.permission)) {
      message.channel.send(__('main.insufficientPermission'))
      return
    }

    command.execute(message, args)
  } catch (err) {
    if (!(err instanceof CustomError)) {
      console.error(err)
      message.channel.send(__('main.unknownError'))
    }
    if (err.type === 'ParserError') { message.channel.send(_s(err.key, { option: err.option, flag: err.flag })) }
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
