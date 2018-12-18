'use strict'
class OperationalError extends Error {
  constructor (key, data) {
    super()
    Error.captureStackTrace(this, OperationalError)
    this.key = key
    this.data = data
  }
}

module.exports = OperationalError
