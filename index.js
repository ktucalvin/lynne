'use strict'
require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const parse = require('./parser')
const commands = require('./command-registry')

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
      message.channel.send('That\'s not a command that I understand, sorry!')
      return
    }
    command.execute(message, args)
  } catch (err) {
    console.log(err)
  }
})

function close() {
  console.log('\nMystia is going to sleep!')
  client.destroy()
  process.exit(0)
}

process.on('SIGINT', close)
process.on('SIGTERM', close)

client.login(process.env.TOKEN)
