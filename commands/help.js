'use strict'
module.exports = new function() {
  const { RichEmbed } = require('discord.js')
  this.name = 'help'
  this.description = 'Mystia helps you with a command or lists all of them!'
  this.usage = 'help [command]'
  this.execute = (message, args) => {
    const commands = require('../command-registry')
    const embed = new RichEmbed()
      .setColor('#FD79A8')
      .setTitle('More information can be found on the wiki')
      .setURL('https://bitbucket.org/ktucalvin/mystia/wiki/Home')
    if (args.length === 0) {
      embed
        .setAuthor('Mystia\'s Commands')
        .setDescription('Type `~help <command>` for more information!\n' + commands.keyArray().join('\n'))
    } else {
      const command = commands.get(args[0])
      if (!command) {
        message.channel.send('That\'s not a command that I know yet..')
        return
      }
      let description = ''
      for (let property in command) {
        if (property !== 'execute' && property !== 'name') {
          description += `**${property.charAt(0).toUpperCase() + property.slice(1)}:** ${command[property]}\n`
        }
      }

      embed
        .setAuthor(`Help: ${command.name}`)
        .setDescription(description)
    }
    message.channel.send(embed)
  }
}()
