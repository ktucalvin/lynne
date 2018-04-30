'use strict'
module.exports = {
  name: 'help',
  description: 'Mystia helps you with a command or lists all of them',
  usage: 'help [command]',
  execute(message, args) {
    const commands = require('../command-registry.js')
    const RichEmbed = require('discord.js').RichEmbed
    const embed = new RichEmbed()
      .setColor('#FD79A8')
      .setTitle('More information can be found on the wiki')
      .setURL('https://bitbucket.org/ktucalvin/mystia/wiki/Home')
    if (args.length === 0) {
      const list = []
      for (const command of commands.keys()) {
        list.push(command)
      }

      embed
        .setAuthor('Mystia\'s Commands')
        .setDescription('Type `~help <command>` for more information!\n' + list.join('\n'))
    } else if (args.length === 1) {
      const command = commands.get(args[0])
      if (!command) {
        message.channel.send('That\'s not a command that I know yet..')
        return
      }
      let description = ''
      for (let property in command) {
        if (property !== 'execute') {
          description += `**${property.charAt(0).toUpperCase() + property.slice(1)}**: ${command[property]}\n`
        }
      }

      embed
        .setAuthor(`Help: ${command.name}`)
        .setDescription(description)
    }
    message.channel.send(embed)
  }
}
