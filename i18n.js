'use strict'
const fs = require('fs')
let { locale } = require('./config.json')
let lang

module.exports = new function() {
  this.init = specificLocale => {
    if (lang) { return }
    if (specificLocale) { locale = specificLocale }
    if (!fs.existsSync(`./lang/${locale}.json`)) {
      throw new Error(`${locale} does not have json file`)
    }
    lang = require(`./lang/${locale}.json`)
  }

  this.translate = (key) => {
    if (!lang) { throw new Error('I18n module was not initialized before use') }
    if (!lang[key]) {
      throw new Error(`Key ${key} not present in ${locale}`)
    }
    return lang[key]
  }

  this.substitute = (key, ...substitutions) => {
    let str = this.translate(key)
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

  this.has = key => lang.hasOwnProperty(key)
  this.clear = () => { lang = null }
}()
