'use strict'
require('dotenv').config()
require('module-alias/register')
const { Client } = require('discord.js')
const i18n = require('$lib/i18n')
const handleMessage = require('./handlers/message-handler')
const client = new Client()

client.on('ready', () => console.log('Mystia has woken up!'))
client.on('message', handleMessage)

function close () {
  console.log('\nMystia is going to sleep!')
  i18n.saveServerLocalizations()
  client.destroy()
  process.exit(0)
}

process.on('SIGINT', close)
process.on('SIGTERM', close)

client.login(process.env.TOKEN)
