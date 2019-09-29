'use strict'
const { Collection } = require('discord.js')
const User = require('./FakeUser')
const Member = require('./FakeMember')
const VoiceChannel = require('./FakeVoiceChannel')

function Channel () {
  this.send = msg => msg
}

function Message (msg) {
  this.content = msg
  this.channel = new Channel()
  this.author = new User('0000')
  this.member = new Member('0000')
  this.guild = {
    id: '0000',
    me: new Member('lynne'),
    channels: new Collection(),
    unban: () => {}
  }
  this.mentions = {
    channels: new Collection(),
    everyone: false,
    members: new Collection(),
    roles: new Collection(),
    users: new Collection()
  }

  this.member.user = this.author
  this.member.guild = this.guild

  this._createVoiceChannel = () => {
    const vc = this.member.voiceChannel = new VoiceChannel()
    vc.join = () => {
      this.guild.me.voiceChannel = vc
      return Promise.resolve(vc.connection)
    }
  }
}

module.exports = Message
