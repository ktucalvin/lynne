'use strict'
const fs = require('fs')
let { defaultLocale } = require('./config.json')
const locales = new Map()
const servers = new Map()

module.exports = new function() {
  this.init = () => {
    const availableLocales = fs.readdirSync('./lang').filter(e => e !== 'server-localizations.json')
    for (let i = 0; i < availableLocales.length; i++) {
      const locale = availableLocales[i]
      locales.set(locale.slice(0, -5), require(`./lang/${locale}`))
    }
    if (fs.existsSync('./lang/server-localizations.json')) {
      const localizations = require('./lang/server-localizations.json')
      for (const [server, locale] of Object.entries(localizations)) { servers.set(server, locale) }
    }
  }

  this.translate = (key, guildId) => {
    if (!locales.size) { throw new Error('No locales registered') }
    const locale = this.getServerLocale(guildId)
    const translations = locales.get(locale)
    if (!translations.hasOwnProperty(key)) { throw new Error(`Key ${key} not present in ${locale}`) }
    return translations[key]
  }

  this.getServerLocale = guildId => servers.get(guildId) || defaultLocale

  this.setServerLocale = (guildId, locale) => { servers.set(guildId, locale) }

  this.getAvailableLocales = () => Array.from(locales.keys())

  this.substitute = (key, guildId, ...substitutions) => {
    let str = this.translate(key, guildId)
    let fields = {}
    if (typeof substitutions[0] === 'object') { fields = substitutions.shift() }
    const placeholders = (str.match(/%s/g) || []).length + (str.match(/%\([\w\d]+\)/g) || []).length
    const replacements = substitutions.length + Object.keys(fields).length
    if (replacements < placeholders) { throw new Error(`Not enough substitutions provided to replace string: ${str}`) }
    for (const [key, value] of Object.entries(fields)) {
      str = str.replace(`%(${key})`, value)
    }
    for (let i = 0; i < placeholders; i++) {
      str = str.replace('%s', substitutions[i])
    }
    return str
  }

  this.has = (key, guildId) => locales.get(servers.get(guildId) || defaultLocale).hasOwnProperty(key)

  this.saveServerLocalizations = () => {
    if (!servers.size) { return }
    let data = '{\n'
    for (const [key, value] of servers.entries()) {
      data += `  "${key}": "${value}",\n`
    }
    fs.writeFileSync('./lang/server-localizations.json', data.slice(0, -2) + '\n}')
  }
}()
