const TopGG = require("..")
const { Client } = require("discord.js")
const auth = require("../env.json")

const client = new Client()
const dbl = new TopGG(client, {
  token: auth.dbl,
  // onVote: (user) => console.log(user.username, "is stinky"),
  internalServer: {
    endpoint: "/vote",
  }
})

client.login(auth.token).then(() => {
  require("node-fetch")("http://localhost:6815/vote", {
    method: "post",
    body: JSON.stringify({ vote: { user: "342421078066593803" } }),
    headers: {"content-type": "application/json"}
  })
})