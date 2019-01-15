'use strict'
const compose = require('koa-compose')
const middleware = [
  require('./error-handler'),
  require('./command-executor')
]
module.exports = compose(middleware)
