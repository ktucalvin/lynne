'use strict'
require('module-alias/register')
const fs = require('fs')
const path = require('path')
const Utils = require('./utils')
const { defaultLocale } = require('$config')
const langDirectory = path.join(__dirname, '../lang')
const locales = new Map()
const servers = new Map()

const availableLocales = fs.readdirSync(langDirectory).filter(e => e !== 'server-localizations.json')
for (let i = 0; i < availableLocales.length; i++) {
  const locale = availableLocales[i]
  locales.set(locale.slice(0, -5), Utils.flatten(require(`${langDirectory}/${locale}`)))
}
const localizations = require(`${langDirectory}/server-localizations.json`)
for (const [server, locale] of Object.entries(localizations)) { servers.set(server, locale) }

module.exports = (function () {
  this.translate = (key, guildId, ...substitutions) => {
    const locale = this.getServerLocale(guildId)
    const translations = locales.get(locale)

    // eslint-disable-next-line no-prototype-builtins
    if (!translations.hasOwnProperty(key)) { throw new Error(`Key ${key} not present in ${locale}`) }

    const translation = translations[key]
    let str = Array.isArray(translation) ? translation[Utils.randInt(0, translation.length - 1)] : translation
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

  this.getServerLocale = guildId => servers.get(guildId) || defaultLocale
  this.setServerLocale = (guildId, locale) => { servers.set(guildId, locale) }
  this.getAvailableLocales = () => Array.from(locales.keys())

  this.saveServerLocalizations = () => {
    let data = ''
    for (const [key, value] of servers.entries()) {
      data += `  "${key}": "${value}",\n`
    }
    fs.writeFileSync(`${langDirectory}/server-localizations.json`, '{\n' + data.slice(0, -2) + '\n}\n')
  }

  this.useGuild = guildId => (key, ...substitutions) => this.translate(key, guildId, ...substitutions)

  return this
}.call({}))
