const TopGG = require(".")
const { Client } = require("discord.js")
const auth = require("./env.json")

const client = new Client()
const dbl = new TopGG(client, { token: auth.dbl })
dbl.reviews.fetch({ page: 1, botID: "655390915325591629", limit: 5 }).then(c => {
  c.map(review => {
    console.log(review)
    console.log(review.stars, review.posterAvatarURL({ dynamic: true, format: "png" }))
  })
}, console.error).then(process.exit)