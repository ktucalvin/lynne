'use strict'
require('dotenv').config()
require('module-alias/register')
const fs = require('fs')
const ytdlGetInfo = require('ytdl-getinfo')
const { Client } = require('discord.js')
const i18n = require('$lib/i18n')
const handleMessage = require('./handlers/message-handler')
const client = new Client()

let state = {}
if (fs.existsSync('savestate.json')) {
  state = JSON.parse(fs.readFileSync('savestate.json', 'utf8'))
}

client.on('ready', () => console.log('Lynne has woken up!'))
client.on('message', handleMessage)

function close () {
  console.log('\nLynne is going to sleep!')
  i18n.saveServerLocalizations()
  client.destroy()
  process.exit(0)
}

process.on('SIGINT', close)
process.on('SIGTERM', close)

function initialize () {
  ytdlGetInfo
    .getVersion()
    .then(currentVersion => {
      if (currentVersion !== state.ytdlVersion) {
        console.log('Updating ytdl-getinfo binary...')
        return ytdlGetInfo
          .update()
          .then(version => {
            console.log(`Updated ytdl-getinfo binary to ${version}`)
            state.ytdlVersion = version
            fs.writeFileSync('savestate.json', JSON.stringify(state))
          })
      } else {
        console.log('Have latest ytdl-getinfo binary. Not updating.')
      }
    })
    .then(() => {
      client.login(process.env.TOKEN)
    })
}

initialize()
