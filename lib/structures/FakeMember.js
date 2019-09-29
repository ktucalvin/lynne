'use strict'
function Member (id) {
  this.id = id
  this.kickable = this.bannable = true
  this.displayName = 'displayName:' + id
  this.permissions = new Map()
  this.kick = () => {}
  this.ban = () => {}
  this.mute = this.deaf = false
  this.setMute = bool => { this.mute = bool }
  this.setDeaf = bool => { this.deaf = bool }
  this.setVoiceChannel = () => {}
}

module.exports = Member
