const { Webhook, APIMessage } = require("discord.js")

// this code kinda stinky
module.exports = {
  /** @param {import("topgg.js").Webhook} webhook */
  express(webhook) {
    const app = require("express")()

    this._main(webhook, app)
    app.listen(options.port)
    return app
  },

  /** @param {import("topgg.js").Webhook} webhook */
  fastify(webhook) {
    const app = require("fastify").fastify(),
      express = require("fastify-express")
    app.register(express).after(err => {
      if (err) throw err
      this._main(webhook, app)
    })
    app.listen(options.port, err => {
      if (err) throw err
    })
    return app
  },

  /** @param {import("topgg.js").Webhook} webhook */
  _main(webhook, app) {
    const bodyParser = require("body-parser")
    const { internalServer: options, onVote: vote } = webhook.manager.options

    app.post(options.endpoint, bodyParser.json(), webhook.middleware, options.middleware, async (req, res, next) => {
      if (req.voter && vote)
        try {
          if (vote.dmMessage) {
            const m = typeof vote.dmMessage === "function" ? await vote.dmMessage(req.voter) : vote.dmMessage
            if (m) {
              try {
                await req.voter.send(m)
              } catch (e) {
                if (e.message !== "Missing Access") throw e // dms locked
              }
            }
          }

          if (vote.webhook) {
            const [, id, token, slack] = vote.webhook.url.match(
              /https:\/\/discord\.com\/api\/webhooks\/(\d+)\/(.+?)(\/slack)?/
            )
            const wb = new Webhook(webhook.manager.client, { id, token })
            const m = APIMessage.create(
              wb,
              (typeof vote.webhook.message === "function"
                ? await vote.webhook.message(req.voter)
                : vote.webhook.message) || `${req.voter} just voted for the bot!`
            ).resolveData()
            if (vote.webhook.displayAsUser) {
              m.data.avatarURL = req.voter.displayAvatarURL({ dynamic: true })
              m.data.username = req.voter.username
            }

            await Webhook[`send${slack ? "SlackMessage" : ""}`](m)
          }
        } catch (e) {
          return next(e)
        }

      res.status(204).end()
    })
  },
}
