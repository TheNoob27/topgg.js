const BaseUser = require("./BaseUser")

class Bot extends BaseUser {
  constructor(manager, data) {
    super(manager, data)

    this.library = data.lib || null
    this.prefix = data.prefix

    this.shortDescription = data.shortdesc
    // because its too long and takes up too much space in logs and such - might revert later
    Object.defineProperty(this, "longDescription", {
      value: data.longdesc,
      writable: true,
      configurable: true
    })

    this.tags = data.tags
    this.website = data.website
    this.supportInvite = data.support ? `https://discord.gg/${data.support}` : null
    this.github = data.github
    this.invite = data.invite || `https://discord.com/ouath/authorize?client_id=${this.id}&scope=bot`

    this.owners = data.owners
    this.featuredGuilds = data.guilds
    this.shards = data.shards || []

    this.approvedTimestamp = new Date(data.date).getTime()
    this.certified = data.certifiedBot
    this.vanity = data.vanity ?? null

    this.votes = data.points
    this.monthlyVotes = data.monthlyPoints
    this.serverCount = data.server_count // guildCount serverCount hmm
    this.shardCount = data.shard_count || 0

    this.donateBotGuildID = data.donatebotguildid || null
  }

  get me() {
    return this.id === this.manager.clientID
  }

  get approvedAt() {
    return new Date(this.approvedTimestamp)
  }

  generateInvite(options) {
    if (!options || typeof options !== "object") return this.invite
    return `https://discord.com/ouath/authorize${this.manager._toQuery({
      client_id: this.id,
      guild_id: options.guildID,
      scope: Array.isArray(options.scope) ? options.scope.join(" ") || "bot" : options.scope || "bot",
    })}`
  }

  async fetchReviews(page) {
    const reviews = await this.manager.reviews.fetch(page, this.id)
    return reviews
  }

  async fetchStats() {
    const stats = await this.manager.bots.fetchStats(this.id)
    this.serverCount = stats.serverCount
    this.shards = stats.shards
    this.shardCount = stats.shardCount
    return stats
  }
}

module.exports = Bot