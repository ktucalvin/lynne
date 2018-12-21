'use strict'
const { EventEmitter } = require('events')

function VoiceConnection () {
  this.dispatcher = new EventEmitter()
  this.playStream = () => this.dispatcher
}

function VoiceChannel () {
  this._connection = new VoiceConnection()
  this._connection.channel = this
  this.join = () => Promise.resolve(this._connection)
  this.leave = () => {}
}

module.exports = VoiceChannel
