const TopGG = require(".")
const { Client } = require("discord.js")
const auth = require("./env.json")

const client = new Client()
const dbl = new TopGG(client, { token: auth.dbl, autoPost: true })
dbl.autoPoster.on("posted", stats => console.log("updated guilds to", stats.serverCount, "and shards to", stats.shardCount))
client.login(auth.token)
  .then(() => setTimeout(process.exit, 5000))