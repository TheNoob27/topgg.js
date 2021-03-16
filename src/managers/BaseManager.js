// managers, because splitting code isn't a bad thing :^)
// managers handle endpoints so the main class isn't cluttered with fetchBot() searchBots() fetchUser() etc
class BaseManager {
  constructor(manager) {
    /** @type {import("topgg.js")} */
    this.manager
    Object.defineProperty(this, "manager", { value: manager })
  }

  get clientID() {
    const id = this.manager.client.user?.id
    if (!id) throw new Error("Your bot has not logged in yet, so no ID is present.")
    return id
  }

  get api() {
    return this.manager.api
  }
}

module.exports = BaseManager