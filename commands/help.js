'use strict'
module.exports = new function() {
  const { RichEmbed } = require('discord.js')
  const { translate: __, has: isLocalizable } = require('../i18n')
  const enumerableProperties = ['aliases', 'description', 'usage', 'permissions', 'cooldown']
  this.name = 'help'
  this.description = 'help.description'
  this.usage = 'help [command]'
  this.execute = (message, args) => {
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
      const command = commands.get(args[0])
      if (!command) { message.channel.send(__('main.commandNotFound')); return }
      let description = ''
      for (let i = 0; i < enumerableProperties.length; i++) {
        const property = enumerableProperties[i]
        if (command.hasOwnProperty(property)) {
          const value = command[property]
          embed.addField(__(`help.property.${property}`), isLocalizable(value) ? __(value) : value)
        }
      }
      embed
        .setAuthor(`Help: ${command.name}`)
        .setDescription(description)
    }

    message.channel.send(embed)
  }
}()
