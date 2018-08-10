'use strict'
module.exports = new function() {
  const { RichEmbed } = require('discord.js')
  const i18n = require('../i18n')
  const availableLocales = i18n.getAvailableLocales().filter(e => !e.includes('i18n'))
  const __ = i18n.translate
  const _r = i18n.substitute
  this.name = 'locale'
  this.usage = 'locale <get|list>\nlocale set code'
  this.execute = (message, args) => {
    if (args.length === 0) {
      message.channel.send(__('locale.noBehaviorSpecified', message.guild.id))
      return
    }
    if (!message.member.permissions.has('MANAGE_GUILD')) {
      message.channel.send(__('locale.noPermission', message.guild.id))
      return
    }

    switch (args[0]) {
      case 'get':
        getLocale(message)
        break
      case 'set':
        setLocale(message, args[1])
        break
      case 'list':
        listLocales(message)
        break
    }
  }

  function getLocale(message) {
    message.channel.send(_r('locale.get', message.guild.id, i18n.getServerLocale(message.guild.id)))
  }

  function setLocale(message, locale) {
    if (!locale) {
      message.channel.send(__('locale.set.noLocaleSpecified', message.guild.id))
    } else if (!availableLocales.includes(locale)) {
      message.channel.send(__('locale.set.localeUnavailable', message.guild.id))
    } else {
      i18n.setServerLocale(message.guild.id, locale)
      message.channel.send(_r('locale.set.success', message.guild.id, locale))
    }
  }

  function listLocales(message) {
    const embed = new RichEmbed()
      .setColor('#FD79A8')
      .setTitle(__('locale.list.availableLocales'))
      .setDescription(availableLocales.join(', '))
    message.channel.send(embed)
  }
}()
