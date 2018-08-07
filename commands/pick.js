'use strict'
module.exports = new function() {
  const { translate: __, substitute: _r } = require('../i18n')
  const { getopts } = require('../parser')
  this.name = 'pick'
  this.description = 'pick.description'
  this.usage = '\npick -c\npick [-r] option1 option2 [options...]'
  this.execute = (message, args) => {
    const optmap = new Map()
      .set('ranged', { alias: 'r' })
      .set('card', { alias: 'c' })
    const behavior = getopts(args, optmap).get('flags').pop()
    if (behavior === 'card') {
      message.channel.send(_r('pick.card', { value: __('pick.values')[randInt(0, 12)], suit: __('pick.suits')[randInt(0, 3)] }))
      return
    }

    if (args.length < 2) {
      message.channel.send(__('pick.insufficientOptions'))
      return
    }

    if (behavior === 'ranged') {
      if (!parseInt(args[0]) || !parseInt(args[1])) {
        message.channel.send(__('pick.nonNumericLimit'))
        return
      }
      if (args[0] > args[1]) {
        [args[1], args[0]] = [args[0], args[1]]
      }
      message.channel.send(_r('pick.choose', randInt(args[0], args[1])))
    } else {
      message.channel.send(_r('pick.choose', args[Math.floor(Math.random() * args.length)]))
    }

    function randInt(lo, hi) {
      return Math.round(Math.random() * (hi - lo)) + +lo
    }
  }
}()
