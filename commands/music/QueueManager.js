'use strict'
const { getInfo } = require('ytdl-getinfo')
const { secondsToTimeString } = require('$lib/utils')
const servers = new Map()

function extractMetadata (info) {
  info = info.items[0]
  return {
    title: info.fulltitle,
    duration: secondsToTimeString(info.duration),
    likes: info.like_count,
    dislikes: info.dislike_count,
    tags: (info.tags && info.tags.length) ? info.tags : 'No tags',
    views: info.view_count,
    description: info.description,
    uploader: info.uploader,
    uploadDate: info.upload_date,
    uploaderUrl: info.uploader_url,
    thumbnail: info.thumbnail
  }
}

module.exports = {
  add: (url, guildId) => {
    return getInfo(url).then(info => {
      const song = extractMetadata(info)
      song.url = url
      const Q = servers.get(guildId)
      if (!Q) {
        servers.set(guildId, [song])
      } else {
        Q.push(song)
      }
      return song
    })
  },
  get: guildId => servers.get(guildId),
  flush: guildId => servers.delete(guildId)
}
