'use strict'
const i18n = require('$lib/i18n')
const { getopts } = require('$lib/parser')
const randInt = require('$lib/utils').randInt
const optmap = new Map()
  .set('ranged', { alias: 'r' })
  .set('card', { alias: 'c' })

module.exports = {
  name: 'pick',
  optmap,
  usage: '\npick -c\npick [-r] option1 option2 [options...]',
  execute(message, args) {
    const { __, _s } = i18n.useGuild(message.guild.id)
    const behavior = getopts(args, optmap).get('flags').pop()

    if (behavior === 'card') {
      message.channel.send(_s('pick.card.draw', { value: __('pick.card.values')[randInt(0, 12)], suit: __('pick.card.suits')[randInt(0, 3)] }))
      return
    }

    if (args.length < 2) { message.channel.send(__('pick.insufficientOptions')); return }

    if (behavior === 'ranged') {
      if (!parseInt(args[0]) || !parseInt(args[1])) {
        message.channel.send(__('pick.ranged.nonNumericLimit'))
        return
      }
      if (args[0] > args[1]) {
        [args[1], args[0]] = [args[0], args[1]]
      }
      message.channel.send(_s('pick.choose', randInt(args[0], args[1])))
    } else {
      message.channel.send(_s('pick.choose', args[Math.floor(Math.random() * args.length)]))
    }
  }
}
