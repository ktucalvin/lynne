'use strict'
const { getInfo } = require('ytdl-getinfo')
const { secondsToTimeString } = require('$lib/utils')
const servers = new Map()

function extractMetadata (info) {
  info = info.items[0]
  const date = info.upload_date
  return {
    title: info.fulltitle,
    duration: secondsToTimeString(info.duration),
    likes: info.like_count,
    dislikes: info.dislike_count,
    ratio: info.dislike_count ? ((info.like_count / (info.like_count + info.dislike_count)) * 100).toFixed(2) : 100,
    tags: info.tags ? info.tags.join() : 'No tags',
    views: info.view_count.toLocaleString(),
    description: info.description.length >= 2048 ? info.description.substr(0, 2045) + '...' : info.description,
    uploader: info.uploader,
    uploadDate: new Date(date.substring(0, 4), +date.substring(4, 6) - 1, date.substring(6, 8)).toDateString(),
    uploaderUrl: info.uploader_url,
    thumbnail: info.thumbnail
  }
}

module.exports = {
  add: (url, guildId) => {
    return getInfo(url).then(info => {
      const song = extractMetadata(info)
      song.url = url
      const server = servers.get(guildId)
      if (!server) {
        servers.set(guildId, { queue: [song] })
      } else {
        server.queue.push(song)
      }
      return song
    })
  },
  getQueue: guildId => servers.get(guildId) ? servers.get(guildId).queue : undefined,
  getDispatcher: guildId => servers.get(guildId) ? servers.get(guildId).dispatcher : undefined,
  attachDispatcher: (dispatcher, guildId) => { servers.get(guildId).dispatcher = dispatcher },
  flush: guildId => servers.delete(guildId),
  _inject: (object, guildId) => servers.set(guildId, object)
}
