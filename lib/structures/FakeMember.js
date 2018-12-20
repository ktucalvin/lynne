'use strict'
function Member (id) {
  this.id = id
  this.kickable = this.bannable = true
  this.displayName = 'displayName:' + id
  this.permissions = new Map()
}

module.exports = Member
