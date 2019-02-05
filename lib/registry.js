'use strict'
const fs = require('fs')
const path = require('path')
const { Collection } = require('discord.js')
const cmdDirectory = path.join(__dirname, '../commands')
let registry = new Collection()
let loading = false

// Declarations
let fetch = name => loading ? null : (registry.get(name) || registry.find(cmd => cmd.aliases && cmd.aliases.includes(name)))
let reload = () => {
  loading = true
  walk(cmdDirectory, register)
  loading = false
}

function register (file) {
  if (loading) { delete require.cache[file] }
  const command = require(file)
  if (!command.name) { return }
  let names = [command.name]
  if (command.aliases) { names = names.concat(command.aliases) }
  for (const name of names) {
    if (fetch(name)) { throw new Error(`Duplicate command registered: ${command.name}`) }
  }
  registry.set(command.name, command)
}

function invalidate (file) {
  delete require.cache[file]
}

function walk (dir, fn) {
  const files = fs.readdirSync(dir)
  for (let file of files) {
    if (file === 'test') { continue }
    file = path.join(dir, file)
    if (fs.statSync(file).isDirectory()) {
      walk(file, fn)
    } else {
      fn(file)
    }
  }
}

// Initialization
walk(cmdDirectory, register)

// Exports
module.exports = {
  fetch,
  reload,
  commands: registry,
  purge: () => walk(cmdDirectory, invalidate)
}
