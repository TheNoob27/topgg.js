const { Collection } = require("discord.js")
const Review = require("../structures/Review")
const BaseManager = require("./BaseManager")

class ReviewsManager extends BaseManager {
  async fetch({ page = 1, limit = 20, botID: id = this.clientID } = {}) {
    const reviews = await this.api.client.entities(id).reviews.get({
      query: { page }
    })
    return new Collection(
      reviews
        .slice(0, Math.min(reviews.length, Math.max(limit, 0)) || reviews.length)
        .map(r => [r.id, new Review(this.manager, r)])
    )
  }

  async *iterate(id) {
    // kinda like discord.py's channel.history iterator,
    // so people can optionally fetch multiple pages
    let i = 0
    const res = new Collection()
    while (++i) {
      const r = await this.fetch({ page: i, botID: id })
      if (!r.size) break
      yield* r.values()
      for (const [k, v] of r) res.set(k, v)
      if (r.size < 20) break
    }

    return res
  }

  [Symbol.asyncIterator]() {
    return this.iterate()
  }
}

module.exports = ReviewsManager