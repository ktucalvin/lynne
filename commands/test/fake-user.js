'use strict'

class User {
  constructor(id) {
    this.avatarURL = 'avatarURL:' + id
    this.id = id
    this.username = 'test' + id
    this.permissions = new Map()
  }
}

module.exports = User
