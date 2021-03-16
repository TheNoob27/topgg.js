const BaseUser = require("./BaseUser")

class TopGGUser extends BaseUser {
  constructor(manager, data) {
    super(manager, data)
    this.bio = data.bio
    this.banner = data.banner
    this.color =
      typeof data.color === "string"
        ? parseInt(
            data.color.match(/^#?((?:[\da-f]{3}){2})$/)?.[1] ||
              data.color.match(/^#?([\da-f]{3})$/)?.[1].replace(/(\w)/g, "$1$1"),
            16
          ) || null
        : null
    if (isNaN(this.color)) this.color = null

    this.supporter = data.supporter
    this.certified = data.certifiedDev
    this.moderator = data.mod
    this.websiteModerator = data.webMod // bot reviewers?
    this.admin = data.admin

    this.socials = data.social || {}
  }

  get hexColor() {
    return this.color && `#${this.color.toString(16)}`
  }
}

module.exports = TopGGUser