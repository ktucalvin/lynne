'use strict'
const { parse } = require('$lib/parser')
const i18n = require('$lib/i18n')
const registry = require('$lib/registry')

module.exports = async function executeCommand (message, next) {
  const { __, _s } = i18n.useGuild(message.guild.id)
  const { name, args } = parse(message.content)
  if (!name) { return }
  const command = registry.fetch(name)
  const permissions = message.member.permissions

  if (!command) { message.channel.send(__('main.commandNotFound')); return }
  if (command.permission && !permissions.has(command.permission)) {
    message.channel.send(__('main.insufficientPermission'))
    return
  }
  const missingRole = command.role && !message.member.roles.find(role => role.name.toLowerCase() === command.role.toLowerCase())
  if (missingRole && !message.member.permissions.has('ADMINISTRATOR')) {
    message.channel.send(_s('main.missingRole', command.role))
    return
  }
  await command.execute(message, args)
  await next()
}
