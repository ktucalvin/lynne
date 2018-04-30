'use strict'
require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const parse = require('./parser')

client.on('ready', () => {
  console.log('Mystia has woken up!')
})

client.on('message', message => {
  if (message.author.bot) { return }
  try {
    const { name, args } = parse(message.content)
    message.channel.send(`Name: ${name} | Args: ${args}`)
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
