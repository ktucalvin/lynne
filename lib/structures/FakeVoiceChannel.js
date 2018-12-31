'use strict'
const { EventEmitter } = require('events')

function VoiceConnection () {
  this.dispatcher = new EventEmitter()
  this.dispatcher.end = () => {}
  this.playStream = () => this.dispatcher
}

function VoiceChannel () {
  this.connection = new VoiceConnection()
  this.connection.channel = this
  this.join = () => Promise.resolve(this.connection)
  this.leave = () => {}
}

module.exports = VoiceChannel
