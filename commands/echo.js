'use strict'
const i18n = require('$lib/i18n')
const { getopts } = require('$lib/parser')
const optmap = new Map()
  .set('to', { alias: 't', hasParam: true })
  .set('setref', { alias: 's', hasParam: true })
  .set('getref', { alias: 'g' })
let ref

module.exports = {
  name: 'echo',
  optmap,
  aliases: ['say'],
  usage: ['echo [string]'],
  permission: 'MANAGE_GUILD',
  execute (message, args) {
    if (!args.length) {
      message.channel.send('_ _') // send blank line
      return
    }

    const __ = i18n.useGuild(message.guild.id)
    const opts = getopts(args, optmap)
    if (opts.get('flags').length) {
      ref ? message.channel.send(__('echo.getref.notice', `<#${ref.id}>`)) : message.channel.send(__('echo.getref.noReference'))
      return
    }

    const setref = opts.get('setref')
    const out = opts.get('to') ? message.mentions.channels.find(cmd => opts.get('to').includes(cmd.id)) : undefined
    ref = setref ? message.mentions.channels.find(cmd => setref.includes(cmd.id)) : ref
    if (setref === 'none') { ref = null; message.channel.send(__('echo.clearRef')) }

    const str = args.join(' ') + '_ _'
    if (out) {
      out.send(str)
    } else if (ref) {
      str !== '_ _' ? ref.send(str) : message.channel.send(__('echo.setref.notice', setref))
    } else {
      message.channel.send(str)
    }
  }
}
