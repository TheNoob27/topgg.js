/** @type {typeof import("topgg.js")} */
const TopGG = require("../src")
const old = TopGG.prototype.request
TopGG.prototype.request = function (m, url, ops) {
  console.log(m, url, "with options:", ops || "none")
  if (m !== "POST") return old.apply(this, arguments)
  return Promise.resolve()
}
module.exports = TopGG