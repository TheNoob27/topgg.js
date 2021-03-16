const TopGG = require("..")
const { Client } = require("discord.js")
const auth = require("../env.json")

const client = new Client()
const dbl = new TopGG(client, {
  token: auth.dbl,
  onVote: {
    dmMessage: { content: "thank you for being my test subject" },
    webhook: {
      url: auth.webhook,
      displayAsUser: true,
      message: {
        content: "I just voted!! also i got dm'd lol haha ur bad",
        embeds: [
          { description: "let's, goooooooOOOddem" }
        ]
      }
    }
  },
  internalServer: {
    endpoint: "/vote",
    middleware: (req, res, next) => console.log("hello from", req.voter.username) || next(),
  }
})

client.login(auth.token).then(() => {
  require("node-fetch")("http://localhost:6815/vote", {
    method: "post",
    body: JSON.stringify({ vote: { user: "342421078066593803" } }),
    headers: {"content-type": "application/json"}
  })
})