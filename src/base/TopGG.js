const BotsManager = require("../managers/BotsManager")
const ReviewsManager = require("../managers/ReviewsManager")
const Webhook = require("./Webhook")
const Request = require("../util/route")
const AutoPoster = require("./AutoPoster")
const TopGGUser = require("../structures/TopGGUser")
const { default: fetch } = require("node-fetch")

class TopGG {
  constructor(client, options) {
    if (!client || !(client instanceof require("discord.js").Client))
      throw new Error("No discord.js client was provided.")

    /** @type {import("discord.js").Client} */
    this.client
    Object.defineProperty(this, "client", { value: client })
    if (typeof options === "string") this._validateOptions({ token: options })
    else this._validateOptions(Object.assign({}, options)) // so we can modify it

    this.webhook = new Webhook(this)

    this.bots = new BotsManager(this)
    this.reviews = new ReviewsManager(this)

    if (this.options.autoPost) this.autoPoster = new AutoPoster(this)
    this.request = this.request.bind(this)
  }

  get api() {
    return Request(this.request)
  }

  get bot() {
    return this.bots // shortcut, makes stuff like `topgg.bot.fetch()` make more sense
  }

  // endpoints that can't be split and are kinda standalone
  async fetchUser(id) {
    const user = await this.api.users(id).get()
    return new TopGGUser(this, user)
  }



  async request(method, route, options = {}) {
    options = options ?? {}
    const headers = {
      Authorization: (options.auth ?? this.token) || null,
    }
    if (method !== "GET") headers["Content-Type"] = "application/json"
    if (options.query) route += this._toQuery(options.query)
    const res = await fetch(`https://top.gg/api${route}`, {
      method,
      headers,
      body: options.data != null ? JSON.stringify(options.data) : null,
    })
    const data = await (res.headers.get("content-type").startsWith("application/json") ? res.json() : res.buffer())
    if (!res.ok) throw data || new Error(`${res.status} ${res.statusText}`)
    return data
  }

  _toQuery(json) {
    if (!json || typeof json !== "object") return ""
    const f = s =>
      encodeURIComponent(typeof s === "number" && isFinite(s) || typeof s !== "number" && s != null ? s : "")
    let str = "?"

    for (const [key, val] of Object.entries(json)) {
      const prop = f(key)
      if (!prop) continue
      const value = Array.isArray(val)
        ? val
            .map(f)
            .filter(v => v !== "")
            .join(`&${prop}=`)
        : f(val)
      if (!value) continue
      str += `${str === "?" ? "" : "&"}${prop}=${value}`
    }
    return str === "?" ? "" : str
  }

  /** @param {import("topgg.js").Options} options */
  _validateOptions(options) {
    if (options.token) {
      Object.defineProperty(this, "token", { value: options.token, writable: true, configurable: true })
      delete options.token
    }
    if (options.auth) {
      // why not
      Object.defineProperty(this, "auth", { value: options.auth, writable: true, configurable: true })
      delete options.auth
    }

    if (options.autoPost) {
      options.autoPost = {
        enabled: options.autoPost !== false,
        interval: options.autoPost.interval
      }
    }

    if (options.onVote && typeof options.onVote === "object" && options.onVote.webhook)
      if (!options.onVote.webhook.url || !options.onVote.webhook.url.startsWith("https://discord.com/api/webhooks"))
        options.onVote.webhook = null
      else if (typeof options.onVote === "function") {
        if (options.internalServer) {
          const handle = options.onVote
          options.internalServer.middleware = function(req, res, next) {
            handle(req.voter, req, res)
            next()
          }
        }
        options.onVote = null
      }

    if (options.internalServer) {
      options.internalServer = Object.assign(
        {
          endpoint: "/dblwebhook",
          port: 6815,
          middleware: [],
        },
        {
          ...options.internalServer,
          type: options.internalServer.type?.toLowerCase?.() || "express",
        }
      )
      if (!["express", "fastify"].includes(options.internalServer.type)) options.internalServer.type = "express"
      if (!options.internalServer.middleware && !options.onVote?.webhook) // options.internalServer = null
        throw new Error("To use the internal servers, you must provide onVote or middleware in options.")
    }

    this.options = options
  }
}

module.exports = TopGG