class Base {
  constructor(manager) {
    /** @type {import("topgg.js").default} */
    this.manager
    Object.defineProperty(this, "manager", { value: manager })
  }
}

module.exports = Base