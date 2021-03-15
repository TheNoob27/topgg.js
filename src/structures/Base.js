class Base {
  constructor(manager) {
    /** @type {import("topgg.js")} */
    this.manager
    Object.defineProperty(this, "manager", { value: manager })
  }
}

module.exports = Base