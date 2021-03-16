const { Webhook, APIMessage } = require("discord.js")

// this code kinda stinky
module.exports = {
  /** @param {import("topgg.js").default.Webhook} webhook */
  express(webhook) {
    const app = require("express")()
    const bodyParser = require("body-parser")
    const { internalServer: options, onVote: onVote } = webhook.manager.options

    app.post(
      options.endpoint,
      bodyParser.json(),
      webhook.middleware,
      options.middleware,
      async (req, res, next) => {
        try {
          if (req.voter && onVote) await this._handle(req.voter, onVote)
          res.status(200).end()
        } catch(e) {
          next(e)
        }
      }
    )
    app.listen(webhook.manager.options.internalServer.port)
    return app
  },

  /** @param {import("topgg.js").default.Webhook} webhook */
  fastify(webhook) {
    const app = require("fastify").fastify()
    const { internalServer: options, onVote: onVote } = webhook.manager.options
    app.decorateRequest("voter", null)
    app.post(options.endpoint, async (req, res) => {
      let err = await new Promise(r => webhook.middleware(req, res, r))
      if (err) throw err
      if (typeof options.middleware === "function")
        err = await new Promise(r => options.middleware(req, res, r))
      if (err) throw err
      if (req.voter && onVote) await this._handle(req.voter, onVote)//.catch(console.error)
    })

    // errors with fastify are harder to handle as they're being sent to the user

    app.listen(options.port, err => {
      if (err) throw err
    })
    return app
  },

  /** @param {import("discord.js").User} user @param {import("topgg.js").default.Options["onVote"]} options */
  _handle: async (user, options) => {
    if (options.dmMessage) {
      const m = typeof options.dmMessage === "function" ? await options.dmMessage(user) : options.dmMessage
      if (m) {
        try {
          await user.send(m)
        } catch (e) {
          if (e.message !== "Missing Access") throw e // dms locked
        }
      }
    }

    if (options.webhook) {
      const [, id, token, slack] = options.webhook.url.match(
        /^https:\/\/discord\.com\/api\/webhooks\/(\d+)\/(.+?)(\/slack)?$/
      )
      const wb = new Webhook(user.client, { id, token })
      const m = APIMessage.create(
        wb,
        (typeof options.webhook.message === "function"
          ? await options.webhook.message(user)
          : options.webhook.message) || `${user} just voted for the bot!`
      ).resolveData()
      if (options.webhook.displayAsUser) {
        m.data.avatar_url = user.displayAvatarURL({ dynamic: true })
        m.data.username = user.username
      }

      await wb[`send${slack ? "SlackMessage" : ""}`](m)
    }
  },
}
