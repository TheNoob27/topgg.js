const TopGG = require(".")
const { Client } = require("discord.js")
const auth = require("./env.json")

const client = new Client()
const dbl = new TopGG(client, { token: auth.dbl })
dbl.fetchUser("342421078066593803").then(user => console.log(user, user.hexColor), console.error).then(process.exit)