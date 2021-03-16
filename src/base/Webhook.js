const bodyParser = require("body-parser")
const internalServers = require("../util/internalServers")

class Webhook {
  /** @param {import("topgg.js").default} manager */
  constructor(manager) {
    this.manager = manager
    this.middleware = this.middleware.bind(this)
    
    if (this.manager.options.internalServer)
      this.server = internalServers[this.manager.options.internalServer.type](this)
  }

  middleware(req, res, next) {
    // app.post("/wbh", webhook.middleware, () => { ... })
    const handle = () => {
      // req.body.type is "test" if its a test - hmmmm
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

module.exports = Webhook