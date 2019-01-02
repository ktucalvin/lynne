'use strict'
const fs = require('fs')
const path = require('path')
const { Collection } = require('discord.js')
const cmdDirectory = path.join(__dirname, '../commands')
let registry = new Collection()
let loading = false

let fetch = name => loading ? null : (registry.get(name) || registry.find(cmd => cmd.aliases && cmd.aliases.includes(name)))
let reload = () => {
  loading = true
  walk(cmdDirectory)
  loading = false
}

function hasDuplicate (cmd) {
  let names = [cmd.name]
  if (cmd.aliases) {
    names = names.concat(cmd.aliases)
  }
  for (const name of names) {
    if (fetch(name)) return true
  }
}

function walk (dir, fn) {
  const files = fs.readdirSync(dir)
  for (let file of files) {
    if (file === 'test') { continue }
    file = path.join(dir, file)
    if (fs.statSync(file).isDirectory()) {
      walk(file, fn)
    } else {
      if (loading) { delete require.cache[file] }
      const command = require(file)
      if (!command.name) { continue }
      if (hasDuplicate(command)) { throw new Error(`Duplicate command registered: ${command.name}`) }
      registry.set(command.name, command)
      console.log(`[Registry] Loaded command: ${command.name}`)
    }
  }
}

walk(cmdDirectory)

module.exports = { fetch, reload, commands: registry }
