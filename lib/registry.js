'use strict'
const fs = require('fs')
const path = require('path')
const { Collection } = require('discord.js')
const registry = new Collection()

registry.fetch = name => registry.get(name) || registry.find(cmd => cmd.aliases && cmd.aliases.includes(name))

function walk(dir) {
  const files = fs.readdirSync(dir)
  for (let file of files) {
    if (file === 'test') { continue }
    file = path.join(dir, file)
    if (fs.statSync(file).isDirectory()) {
      walk(file)
    } else {
      const command = require(file)
      if (registry.fetch(command.name)) { throw new Error(`Duplicate command registered: ${command.name}`) }
      registry.set(command.name, command)
    }
  }
}

walk(path.join(__dirname, '../commands'))

module.exports = registry
