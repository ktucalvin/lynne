'use strict'
const { prefix, names } = require('./config.json')

function stripIdentifier(msg) {
  if (msg.startsWith(prefix)) {
    return msg.slice(prefix.length)
  }
  for (const name of names) {
    if (msg.startsWith(name)) {
      return msg.slice(name.length)
    }
  }
}

function clean(string) {
  return string.toLowerCase().replace(/[ \s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '')
}

function isCommand(msg) {
  msg = msg.replace(/ /g, '')
  if (msg.startsWith(prefix)) { return true }
  for (const name of names) {
    if (msg.startsWith(name)) { return true }
  }
}

module.exports = msg => {
  if (!isCommand(msg)) { return {} }

  msg = stripIdentifier(msg)
  if (!msg) { throw new SyntaxError('EmptyCommand') }

  let args = []
  msg += ' '
  while (msg.length > 0) {
    let start = msg.search(/[^\s]/)
    if (start === -1) { break }
    let end
    if (msg.charAt(start) === '"') {
      start++
      end = msg.indexOf('"', start)
      if (end === -1) { throw new SyntaxError('MissingQuote') }
    } else if (msg.charAt(start) === "'") {
      start++
      end = msg.indexOf("'", start)
      if (end === -1) { throw new SyntaxError('MissingQuote') }
    } else {
      end = msg.search(/\s/)
    }
    args.push(msg.slice(start, end))
    msg = msg.slice(end + 1)
  }

  if (!args[0] && args.length === 1) {
    throw new SyntaxError('EmptyCommand')
  }

  while (!clean(args[0])) {
    args.shift()
  }
  args = args.filter(e => { return e !== '' })

  if (args.length === 1) {
    return { name: clean(args[0]), args: [] }
  } else {
    const name = clean(args.shift())
    return { name, args }
  }
}
