'use strict'
const fs = require('fs')
const path = require('path')
const registry = new Map()

function walk(dir) {
  const files = fs.readdirSync(dir)
  for (let file of files) {
    file = path.join(dir, file)
    if (fs.statSync(file).isDirectory()) {
      walk(file)
    } else {
      const command = require('./' + file)
      registry.set(command.name, command)
    }
  }
}

walk('./commands')

module.exports = registry
