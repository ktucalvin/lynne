'use strict'
module.exports = new function() {
  const { RichEmbed } = require('discord.js')
  const i18n = require('../i18n')
  const enumerableProperties = ['usage', 'aliases', 'permissions', 'cooldown']
  this.name = 'help'
  this.description = 'help.description'
  this.usage = 'help [command]'
  this.execute = (message, args) => {
    const { __ } = i18n.useGuild(message.guild.id)
    const commands = require('../command-registry')
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

      embed.addField(__('help.property.description'), __(`${command.name}.description`) + getOptDescription(command, __))
      for (let i = 0; i < enumerableProperties.length; i++) {
        const property = enumerableProperties[i]
        if (command.hasOwnProperty(property)) {
          const value = command[property]
          embed.addField(__(`help.property.${property}`), i18n.has(value, message.guild.id) ? __(value) : value)
        }
      }
      embed.setAuthor(`Help: ${command.name}`)
    }

    message.channel.send(embed)
  }

  function getOptDescription(command, translate) {
    if (!command.optmap) { return }
    const opts = Array.from(command.optmap.keys()).sort()
    let description = ''
    for (let i = 0; i < opts.length; i++) {
      const option = opts[i]
      const spec = command.optmap.get(option)
      const optDesc = translate(`${command.name}.opt.${option}.description`)
      description += '\n`'
      if (spec.alias) { description += `-${spec.alias} ` }
      description += `--${option}\`\n\`${optDesc}\``
    }
    return description
  }
}()
