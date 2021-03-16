const { Collection } = require("discord.js")
const BaseUser = require("../structures/BaseUser")
const Bot = require("../structures/Bot")
const BaseManager = require("./BaseManager")

class BotsManager extends BaseManager {
  // methods are async because i'll do something later
  async fetch(id = this.clientID) {
    if (typeof id === "string") {
      const bot = await this.api.bots(id).get()
      return new Bot(this.manager, bot)
    } else {
      if (!id) return []
      let { limit, offset, search, sort, fields } = id
      if (search && typeof search === "object")
        search = Object.entries(search)
          .map(([k, v]) => `${BotsManager.convert[k] || k}: ${v}`)
          .join(" ")
      if (Array.isArray(fields)) fields = fields.join(", ")
      const data = await this.api.bots.get({ query: { limit, offset, search, sort, fields } })
      const bots = new Collection(data.results.map(bot => [bot.id, new Bot(this.manager, bot)]))
      bots.total = data.total
      return bots
    }
  }

  search(query) {
    return this.fetch({ search: { username: query } })
  }

  async fetchVotes() {
    const votes = await this.api.bots.votes.get()
    return new Collection(votes.map(d => [d.id, new BaseUser(this.manager, d)]))
  }

  async hasVoted(userID) {
    const res = await this.api.bots.check.get({ query: { userId: userID } })
    return !!res.voted
  }

  async fetchStats(id = this.clientID) {
    const stats = await this.api.bots(id).stats.get()
    return {
      serverCount: stats.server_count || 0,
      shardCount: stats.shard_count || 0,
      shards: stats.shards || [],
    }
  }

  async postStats(options) {
    if (typeof options === "number") options = { serverCount: options }
    else if (options == null) { // reject modernity, return to dblapi.js
      options = {}
      const { client } = this.manager
      if (client.shard) {
        options.shardCount = client.shard.count ?? client.shard.shardCount ?? 0
        options.serverCount = await client.shard
          .broadcastEval("this.guilds.cache.size")
          .then(d => d.reduce((p, v) => v + p, 0))
      } else {
        options.shardCount = client.ws.totalShards === 1 ? undefined : client.ws.totalShards
        options.serverCount = client.guilds.cache.size
      }
    }

    // shards (number[]) and shard_id (number) are quite pointless tbh and who cares
    const { serverCount: server_count, shardCount: shard_count } = options
    const data = {
      ...(server_count != null && { server_count }),
      ...(shard_count != null && { shard_count })
    }
    // idk what posting undefined would do
    if (Object.keys(data).length) await this.api.bots.stats.post({ data })
    return options
  }
}

// because dbl stinky
BotsManager.convert = {
  defaultAvatar: "defAvatar",
  library: "lib",
  shortDescription: "shortdesc",
  longDescription: "longdesc",
  supportInvite: "support",
  featuredGuilds: "guilds",
  approvedTimestamp: "date",
  certified: "certifiedBot",
  votes: "points",
  monthlyVotes: "monthlyPoints",
  serverCount: "server_count",
  shardCount: "shard_count",
  donateBotGuildID: "donatebotguildid"
}

module.exports = BotsManager