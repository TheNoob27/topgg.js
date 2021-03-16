const TopGG = require(".")
const { Client } = require("discord.js")
const auth = require("./env.json")

const client = new Client()
const dbl = new TopGG(client, { token: auth.dbl })
dbl.bot.fetch("655390915325591629").then(console.log, console.error).then(process.exit)