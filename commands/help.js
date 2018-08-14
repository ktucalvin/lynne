'use strict'
const { RichEmbed } = require('discord.js')
const i18n = require('../i18n')
let commands
const enumerableProperties = ['usage', 'aliases', 'cooldown']

function getOptDescription(command, translate) {
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

module.exports = new function() {
  this.name = 'help'
  this.usage = 'help [command]'
  this.execute = (message, args) => {
    if (!commands) { commands = require('../command-registry') }
    const { __ } = i18n.useGuild(message.guild.id)
    const embed = new RichEmbed()
      .setColor('#FD79A8')
      .setTitle(__('help.wikiExplanation'))
      .setURL('https://bitbucket.org/ktucalvin/mystia/wiki/Home')

    if (args.length === 0) {
      embed
        .setAuthor(__('help.title'))
        .setDescription(__('help.getDetailedInformation') + commands.keyArray().join('\n'))
    } else {
      const command = commands.get(args[0]) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]))
      if (!command) { message.channel.send(__('main.commandNotFound')); return }

      embed.setAuthor(`Help: ${command.name}`)
      embed.addField(__('help.property.description'), __(`${command.name}.description`) + (getOptDescription(command, __) || ''))
      for (let i = 0; i < enumerableProperties.length; i++) {
        const property = enumerableProperties[i]
        if (command.hasOwnProperty(property)) {
          embed.addField(__(`help.property.${property}`), command[property])
        }
      }
      if (command.permission) { embed.addField(__('help.property.permissions'), __(`permission.${command.permission}`)) }
    }

    message.channel.send(embed)
  }
}()
