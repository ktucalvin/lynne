'use strict'
const fs = require('fs')
const path = require('path')
const { Collection } = require('discord.js')
const registry = new Collection()

function walk(dir) {
  const files = fs.readdirSync(dir)
  for (let file of files) {
    if (file !== 'test') {
      file = path.join(dir, file)
      if (fs.statSync(file).isDirectory()) {
        walk(file)
      } else {
        const command = require('./' + file)
        registry.set(command.name, command)
      }
    }
  }
}

walk('./commands')

module.exports = registry
