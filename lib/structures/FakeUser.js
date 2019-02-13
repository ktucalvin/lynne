'use strict'

function User (id) {
  this.id = id
  this.avatarURL = 'avatarURL:' + id
  this.username = 'username:' + id
  this.discriminator = id
}

module.exports = User
