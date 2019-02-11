'use strict'
function Member (id) {
  this.id = id
  this.kickable = this.bannable = true
  this.displayName = 'displayName:' + id
  this.permissions = new Map()
  this.kick = () => {}
}

module.exports = Member
