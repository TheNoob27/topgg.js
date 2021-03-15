const { Collection } = require("discord.js")
const Review = require("../structures/Review")
const BaseManager = require("./BaseManager")

class ReviewsManager extends BaseManager {
  async fetch(page = 1, id = this.clientID) {
    const reviews = await this.api.client.entities(id).reviews.get({
      query: { page }
    })
    return new Collection(reviews.map(r => [r.id, new Review(this.manager, r)]))
  }

  async *iterate(id) {
    // kinda like discord.py's channel.history iterator,
    // so people can optionally fetch multiple pages
    let i = 0
    const res = new Collection()
    while (++i) {
      const r = await this.fetch(i, id)
      if (!r.length) break
      yield* r.values()
      for (const [k, v] of r) res.set(k, v)
    }

    return res
  }

  [Symbol.asyncIterator]() {
    return this.iterate()
  }
}

module.exports = ReviewsManager