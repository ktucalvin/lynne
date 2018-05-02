'use strict'
const { prefix, names } = require('./config.json')

function stripIdentifier(msg) {
  if (msg.toLowerCase().startsWith(prefix)) {
    return msg.slice(prefix.length)
  }
  for (const name of names) {
    if (msg.toLowerCase().startsWith(name)) {
      return msg.slice(name.length)
    }
  }
}

function clean(string) {
  return string.toLowerCase().replace(/[ \s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '')
}

function isCommand(msg) {
  msg = msg.replace(/ /g, '').toLowerCase()
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
  let start, end
  msg += ' '

  function collapseQuote(mark) {
    start++
    end = msg.indexOf(mark, start)
    if (end === -1) { throw new SyntaxError('MissingQuote') }
    if (msg.charAt(end - 1) === '\\') {
      msg = msg.substr(0, end - 1) + msg.slice(end)
      end = msg.indexOf(mark, end + 1)
    }
  }
  while (msg.length > 0) {
    start = msg.search(/[^\s]/)
    if (start === -1) { break }
    if (msg.charAt(start) === '"') {
      collapseQuote('"')
    } else if (msg.charAt(start) === "'") {
      collapseQuote("'")
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

  // TODO double-dash -- means don't process options after this
  // IDEA separate quote-collapsing and option-handling into separate functions, why were they merged into this one?

  if (args.length === 1) {
    return { name: clean(args[0]), args: [] }
  } else {
    const name = clean(args.shift())
    return { name, args }
  }
}
