const TopGG = require("./base/TopGG")

module.exports = Object.assign(TopGG, {
  TopGG,
  Webhook: require("./base/Webhook"),
  AutoPoster: require("./base/AutoPoster"),

  Base: require("./structures/Base"),
  BaseUser: require("./structures/BaseUser"),
  Bot: require("./structures/Bot"),
  Review: require("./structures/Review"),
  TopGGUser: require("./structures/TopGGUser"),
  User: require("./structures/TopGGUser"),

  BaseManager: require("./managers/BaseManager"),
  BotsManager: require("./managers/BotsManager"),
  ReviewsManager: require("./managers/ReviewsManager"),

  internalServers: require("./util/internalServers")
})