'use strict'
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
let registry

function getOptDescription (command, translate) {
  if (!command.optmap) { return }
  const opts = Array.from(command.optmap.keys()).sort()
  let description = ''
  for (let i = 0; i < opts.length; i++) {
    const option = opts[i]
    const spec = command.optmap.get(option)
    const optDesc = translate(`${command.name}.${option}.description`)
    description += '\n`'
    if (spec.alias) { description += `-${spec.alias} ` }
    description += `--${option}\`\n\`${optDesc}\``
  }
  return description
}

module.exports = {
  name: 'help',
  usage: ['help [command]'],
  execute (message, args) {
    if (!registry) { registry = require('$lib/registry') }
    const { __ } = i18n.useGuild(message.guild.id)
    const embed = new RichEmbed()
      .setColor('#FD79A8')
      .setTitle(__('help.wikiExplanation'))
      .setURL('https://bitbucket.org/ktucalvin/mystia/wiki/Home')

    if (args.length === 0) {
      const commands = registry.commands.keyArray()
      let padding = 0
      for (const cmd of commands) {
        if (cmd.length > padding) padding = cmd.length
      }
      embed
        .setAuthor(__('help.title'))
        .setDescription(__('help.getDetailedInformation') + '```' + commands.map(e => e.padEnd(padding + 2, ' ')).join('') + '```')
    } else {
      const command = registry.fetch(args[0])
      if (!command) { message.channel.send(__('main.commandNotFound')); return }

      embed
        .setAuthor(`Help: ${command.name}`)
        .addField(__('help.property.description'), __(`${command.name}.description`) + (getOptDescription(command, __) || ''))
        .addField(__('help.property.usage'), command.usage.map(e => '`' + e + '`').join('\n'))
      if (command.aliases) { embed.addField(__('help.property.aliases'), command.aliases) }
      // if (command.cooldown) { embed.addField(__('help.property.cooldown'), command.cooldown) }
      if (command.permission) { embed.addField(__('help.property.permissions'), __(`permission.${command.permission}`)) }
    }

    message.channel.send(embed)
  }
}
