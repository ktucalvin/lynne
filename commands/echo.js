'use strict'
const i18n = require('$lib/i18n')
const { getopts } = require('$lib/parser')
const optmap = new Map()
  .set('to', { alias: 't', hasParam: true })
  .set('setref', { alias: 's', hasParam: true })
  .set('getref', { alias: 'g' })
const references = new Map()

module.exports = {
  name: 'echo',
  optmap,
  aliases: ['say'],
  usage: ['echo [string]'],
  permission: 'MANAGE_GUILD',
  execute (message, args) {
    const __ = i18n.useGuild(message.guild.id)
    const opts = getopts(args, optmap)

    if (opts.get('flags').length) {
      const ref = references.get(message.guild.id)
      ref ? message.channel.send(__('echo.getref.notice', `<#${ref.id}>`)) : message.channel.send(__('echo.getref.noReference'))
      return
    }

    if (opts.get('setref')) {
      const setref = opts.get('setref')
      if (setref === 'none') {
        message.channel.send(__('echo.setref.clear'))
        references.set(message.guild.id, null)
        return
      }
      const channel = message.mentions.channels.find(cmd => setref.includes(cmd.id))
      if (channel) {
        message.channel.send(__('echo.setref.notice', setref))
        references.set(message.guild.id, channel)
      } else {
        message.channel.send(__('echo.setref.notFound'))
      }
    }

    const to = opts.get('to') ? message.mentions.channels.find(cmd => opts.get('to').includes(cmd.id)) : undefined
    const out = to || references.get(message.guild.id) || message.channel
    const str = args.join(' ') + '_ _'
    out.send(str)
  }
}
