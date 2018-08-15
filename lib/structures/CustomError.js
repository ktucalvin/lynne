'use strict'
class CustomError extends Error {
  constructor(type, key, properties) {
    super()
    Error.captureStackTrace(this, CustomError)
    if (typeof key === 'string') {
      this.key = key
      Object.assign(this, properties)
    } else { Object.assign(this, key) }
    this.type = type
  }
}

module.exports = CustomError
