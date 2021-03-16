const TopGG = require(".")
const { Client } = require("discord.js")
const auth = require("./env.json")

const client = new Client()
const dbl = new TopGG(client, { token: auth.dbl })
;(async () => {
  for await (const review of dbl.reviews.iterate("655390915325591629")) console.log(review.stars)
  process.exit()
})()