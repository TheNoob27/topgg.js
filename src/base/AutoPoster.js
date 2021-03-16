const kInterval = Symbol("postingInterval")
const EventEmitter = require("events")

class AutoPoster extends EventEmitter {
  /** @param {import("topgg.js")} manager */
  constructor(manager) {
    super()
    this.manager = manager

    if (this.manager.options.autoPost.enabled) this.start()
  }

  get interval() {
    return this[kInterval]
  }

  async start(post = true) {
    if (this[kInterval]) return true
    await this.waitReady()
    if (post) await this.post()
    this[kInterval] = setInterval(
      () => this.post(),
      Math.max(900000, this.manager.options.autoPost.interval || 1800000) // 30 minutes by default
    )
    return true
  }

  stop() {
    if (!this[kInterval]) return
    clearInterval(this[kInterval])
    delete this[kInterval]
    return
  }

  waitReady() {
    if (this.manager.client.shards) return this._sharderReady()
    // idk how to go about this for libs like kurasuta
    if (this.manager.client.ws.status === 0) return Promise.resolve(true)
    return new Promise(r => this.manager.client.once("ready", r))
  }

  async post() {
    this.emit("posted", await this.manager.bot.postStats())
  }

  _sharderReady() {
    if (this.manager.client.shards.size > 0 && this.manager.client.shards.every(x => x.ready)) return Promise.resolve(true)

    return new Promise(r => {
      const handler = id => {
        if (id !== this.manager.client.shard.count - 1) return
        this.manager.client.off("shardReady", handler)
        r()
      }
      this.manager.client.on("shardReady", handler)
    })
  }
}

module.exports = AutoPoster