'use strict'
require('module-alias/register')
const { prefix } = require('$config')
const OperationalError = require('$structures/OperationalError')

function parse (msg) {
  if (!msg.startsWith(prefix) || msg === prefix) { return { name: null } }
  msg = msg.slice(prefix.length) + ' '

  let args = []
  let start, end

  while (msg.length > 0) {
    start = msg.search(/[\S]/)
    if (start === -1) { break }
    if (msg.charAt(start) === '"' || msg.charAt(start) === "'") {
      collapseQuote(msg.charAt(start))
    } else {
      end = msg.search(/\s/)
    }
    args.push(msg.slice(start, end))
    msg = msg.slice(end + 1)
  }

  args = args.filter(e => e !== '')
  return { name: args.shift(), args }

  function collapseQuote (mark) {
    start++
    end = msg.indexOf(mark, start)
    if (end === -1) { throw new OperationalError('parser.missingQuote') }
    if (msg.charAt(end - 1) === '\\') {
      msg = msg.substr(0, end - 1) + msg.slice(end)
      end = msg.indexOf(mark, end + 1)
    }
  }
}

function getopts (args, optmap) {
  const parsed = new Map().set('flags', [])
  if (!args.some(token => /^-{1,2}\w/.test(token))) { return parsed }
  const dash = args.indexOf('--')
  let tokens = (dash !== -1) ? args.slice(0, dash) : args.slice(0)
  const aliases = new Map()
  for (const [option, { alias } = {}] of optmap) {
    const spec = {}
    Object.assign(spec, optmap.get(option))
    if (alias) {
      spec.long = option
      aliases.set(alias, spec)
    }
  }

  function setopt (spec, token, index) {
    if (spec.hasParam) {
      let param = tokens[index + 1]
      if (!param || /^-{1,2}[A-Za-z]/.test(param)) { param = spec.default } else { tokens[index + 1] = '' }
      if (!param) { throw new OperationalError('parser.needsArgument', { option: token }) }
      parsed.set(token, param)
    } else {
      parsed.get('flags').push(token)
    }
    tokens[index] = ''
  }

  for (let i = 0; i < tokens.length; i++) {
    if (!/^-{1,2}\w/.test(tokens[i])) { continue }
    const long = tokens[i].startsWith('--')
    const token = tokens[i].replace(/^-+/, '')

    if (long) {
      const spec = optmap.get(token)
      if (!spec) { throw new OperationalError('parser.unknownOption', { option: token }) }
      setopt(spec, token, i)
    } else {
      for (let c = 0; c < token.length; c++) {
        const char = token.charAt(c)
        if (!aliases.has(char)) { throw new OperationalError('parser.unknownOption', { option: char }) }
        const spec = aliases.get(char)
        if (spec.hasParam && token.charAt(c + 1)) {
          throw new OperationalError('parser.parameterizedBeforeStandalone', { option: char, flag: token.charAt(c + 1) })
        }
        setopt(spec, spec.long, i)
      }
    }
  }

  const tail = args.slice(tokens.length + 1)
  tokens = tokens.filter(e => e !== '')
  args.splice(0, args.length, ...tokens.concat(tail))
  return parsed
}

module.exports = { parse, getopts }
