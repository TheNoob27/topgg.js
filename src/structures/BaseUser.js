const Base = require("./Base")

class BaseUser extends Base {
  constructor(manager, data) {
    super(manager)

    this.id = data.id
    this.username = data.username
    this.discriminator = data.discriminator
    this.avatar = data.avatar
    this.defaultAvatar = data.defAvatar
    // fetchable data
    this.user = this.manager.client.users.cache.get(this.id) || null
  }

  get tag() {
    return this.discriminator ? `${this.username}#${this.discriminator}` : null
  }

  displayAvatarURL({ format, size, dynamic } = {}) {
    if (!this.avatar) return null // this.defaultAvatar - idk what this is and how to use it lmao
    return this.manager.client.rest.cdn.Avatar(this.id, this.avatar, format, size, dynamic)
  }

  async fetchUser() {
    if (this.user) return this.user
    const u = await this.manager.client.users.fetch(this.id)
    return (this.user = u)
  }
}

module.exports = BaseUser