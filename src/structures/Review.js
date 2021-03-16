const Base = require("./Base")

class Review extends Base {
  constructor(manager, data) {
    super(manager)

    this.id = data.id // like a discord snowflake except at top.gg's epoch iirc
    this.content = data.content
    this.botID = data.entityId
    this.score = data.score // /100, number of stars - 20-40-60-80-100
    this.upvotes = data.votes // number of upvotes
    this.createdTimestamp = new Date(data.timestamp).getTime()
    // seems like editedAt is always the created timestamp
    // this.editedTimestamp = data.editedAt ? new Date(data.editedAt).getTime() : null
    this.flagged = data.isFlagged
    this.flaggedTimestamp = data.isFlagged ? new Date(data.flaggedAt).getTime() : null

    // discord user id
    if (data.poster.avatar) [this.authorID] = data.poster.avatar.match(/\d{16,22}/) || []
    this.posterID = data.posterId // top.gg user
    this.posterUsername = data.poster.username
    this.posterAvatar =
      data.poster.avatar?.match(/(?:https:\/\/cdn\.discordapp\.com\/avatars\/\d+\/|^)(\w+)/)?.[1] || null

    this.reply = data.reply
      ? {
          id: data.reply.id,
          content: data.reply.content,
          authorID: data.reply.posterId,
        }
      : null

    // data.hasVoted will always be false as we're not logged in
  }

  get stars() {
    return Math.round(this.score / 20)
  }

  get createdAt() {
    return new Date(this.createdTimestamp)
  }

  get flaggedAt() {
    return this.flaggedTimestamp && new Date(this.flaggedTimestamp)
  }

  posterAvatarURL({ format, size, dynamic } = {}) {
    if (!this.posterAvatar || !this.authorID) return null
    return this.manager.client.rest.cdn.Avatar(this.authorID, this.posterAvatar, format, size, dynamic)
  }
}

module.exports = Review