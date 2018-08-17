'use strict'
const { RichEmbed } = require('discord.js')
const i18n = require('$lib/i18n')
const availableLocales = i18n.getAvailableLocales().filter(e => !e.includes('i18n'))

module.exports = {
  name: 'locale',
  usage: ['locale <get|list>', 'locale set code'],
  permission: 'MANAGE_GUILD',
  execute(message, args) {
    const { __, _s } = i18n.useGuild(message.guild.id)
    if (args.length === 0) { message.channel.send(__('locale.noBehaviorSpecified')); return }

    switch (args[0]) {
      case 'get':
        message.channel.send(_s('locale.get', i18n.getServerLocale(message.guild.id)))
        break
      case 'set':
        const locale = args[1]
        if (!locale) {
          message.channel.send(__('locale.set.noLocaleSpecified'))
        } else if (!availableLocales.includes(locale)) {
          message.channel.send(__('locale.set.localeUnavailable'))
        } else {
          i18n.setServerLocale(message.guild.id, locale)
          message.channel.send(_s('locale.set.success', locale))
        }
        break
      case 'list':
        const embed = new RichEmbed()
          .setColor('#FD79A8')
          .setTitle(__('locale.list.availableLocales'))
          .setDescription(availableLocales.join(', '))
        message.channel.send(embed)
        break
    }
  }
}
