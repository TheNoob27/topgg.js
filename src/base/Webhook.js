const bodyParser = require("body-parser")
const internalServers = require("../util/internalServers")

class Webhook {
  /** @param {import("topgg.js")} manager */
  constructor(manager) {
    this.manager = manager
    this.middleware = this.middleware.bind(this)
    
    if (this.manager.options.internalServer)
      this.server = internalServers[this.manager.options.internalServer.type](this)
  }

  middleware(req, res, next) {
    if (arguments.length <= 1) { // app.use("/wbh", webhook.middleware("express" || "fastify"), () => { ... })
      let [type = "express"] = arguments
      if (type === "fastify")
        require.resolve("fastify-express") // needs this module, will throw if not installed
      return this.middleware // i think the handler works for both express and fastify
    } else { // app.use("/wbh", webhook.middleware, () => { ... })
      const handle = () => {
        // req.body.type is "test" if its a test
        if (this.manager.options.auth && req.headers.get("Authorization") !== this.manager.options.auth)
          return res.status(403).json({ error: "Unauthorized" })
        const id = req.body.vote?.user // kinda wack ngl
        if (!id) return next()
        this.manager.client.users
          .fetch(id)
          .then(user => {
            req.voter = user // idk about leaving it as req.vote
            next()
          })
          .catch(error => {
            if (error.message === "Unknown User") next()
            // discord can be stinky sometimes
            else next(error)
          })
      }
      if (req.body) handle()
      else bodyParser.json()(req, res, handle)
    }
  }
}

module.exports = Webhook