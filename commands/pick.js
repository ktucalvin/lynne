'use strict'
module.exports = new function() {
  const { getopts } = require('../parser')
  this.name = 'pick'
  this.description = `Mystia will help you pick something!
  -r --ranged
      Pick from a numeric range instead. Requires two numeric inputs
  -c --card
      Pick a card instead`
  this.usage = 'pick [-rc] <option1> <option2> [options...]'
  this.execute = (message, args) => {
    const optmap = new Map()
      .set('ranged', { alias: 'r' })
      .set('card', { alias: 'c' })
    const opts = getopts(args, optmap)
    if (opts.get('flags').includes('card')) {
      const suits = ['diamonds', 'spades', 'hearts', 'clubs']
      const values = ['ace', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'jack', 'queen', 'king']
      message.channel.send(`I got the ${values[randInt(0, values.length - 1)]} of ${suits[randInt(0, 3)]}`)
    } else if (args.length < 2) {
      message.channel.send('You must give me at least two options to pick from!')
    } else if (opts.get('flags').includes('ranged')) {
      if (!parseInt(args[0]) || !parseInt(args[1])) {
        message.channel.send('At least one limit is not an integer!')
        return
      }
      if (args[0] > args[1]) {
        [args[1], args[0]] = [args[0], args[1]]
      }
      message.channel.send(`I choose ${randInt(args[0], args[1])}`)
    } else {
      message.channel.send(`I choose ${args[Math.floor(Math.random() * args.length)]}`)
    }

    function randInt(lo, hi) {
      return Math.round(Math.random() * (hi - lo)) + +lo
    }
  }
}()
