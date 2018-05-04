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

function parse(msg) {
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
  args = args.filter(e => e !== '')
  return { name: clean(args.shift()), args }
}

function getopts(args, optstring, longs, send) {
  function unalias(token) {
    for (const option of longs) {
      if (!option.startsWith(token)) { continue }
      if (option.charAt(token.length) === '=') {
        return option.charAt(token.length + 1)
      } else if (option.charAt(token.length) === ':' && option.charAt(token.length + 1) === '=') {
        return option.charAt(token.length + 2)
      }
    }
    return token
  }

  function classifyArg(token, send) {
    if (token.startsWith('--')) {
      for (const option of longs) {
        if (option.startsWith(token.slice(2))) {
          return 'LONG'
        }
      }
      return 'ARG'
    }

    if (token.startsWith('-')) {
      for (let i = 1; i < token.length; i++) {
        if (!optstring.includes(token.charAt(i))) {
          send(`${token.charAt(i)} is not a valid option!`)
          return 'ARG'
        }
      }
      return 'SHORT'
    }
    return 'ARG'
  }

  function isParameterized(option, valids) {
    if (typeof valids === 'string') {
      return valids.charAt(valids.indexOf(option) + 1) === ':'
    } else {
      const spec = valids.filter(e => e.startsWith(option))[0]
      return spec.charAt(option.length) === ':'
    }
  }

  const options = {
    flags: []
  }
  for (let i = 0; i < args.length; i++) {
    let token = args[i]
    if (token === '--') { return options }
    const type = classifyArg(token, send)
    if (type === 'ARG') { continue }
    if (type === 'LONG') {
      token = token.slice(2)
      if (isParameterized(token, longs)) {
        if (i + 1 >= args.length || classifyArg(args[i + 1], send) !== 'ARG') {
          send(`The option ${token} requires an argument!`)
          return
        }
        options[unalias(token)] = args[i + 1]
        args[i + 1] = ''
      } else {
        options.flags.push(unalias(token))
      }
      continue
    }
    for (let j = 1; j < token.length; j++) {
      const option = token.charAt(j)
      if (isParameterized(option, optstring)) {
        if (i + 1 >= args.length || classifyArg(args[i + 1], send) !== 'ARG') {
          send(`The option ${option} requires an argument!`)
          return
        }
        if (token.charAt(j + 1)) {
          send(`Your options are out of order! The option \`${option}\` must be on the end of a flag.`)
          return
        }
        options[option] = args[i + 1]
        args[i + 1] = ''
      } else {
        options.flags.push(option)
      }
    }
    args[i] = ''
  }
  for (let i = args.length; i >= 0; i--) {
    if (args[i] === '') { args.splice(i, 1) }
  }
  return options
}

module.exports = { parse, getopts }
