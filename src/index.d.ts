namespace Express {
  export interface Request {
    voter?: import("discord.js").User
  }
}

declare module "topgg.js" {
  import { APIMessageContentResolvable, MessageOptions, MessageAdditions, User, Client, Collection } from "discord.js"
  import EventEmitter from "events"

  type SendMessageOptions =
    | APIMessageContentResolvable | MessageOptions | MessageAdditions
    | ((user: User) => APIMessageContentResolvable | MessageOptions | MessageAdditions)
  type Snowflake = `${bigint}`

  export interface Options {
    token: string
    auth?: string

    autoPost: boolean | {
      enabled?: boolean
      interval: number
    }

    onVote: (user: User, req, res) => any | {
      dmMessage: SendMessageOptions
      webhook: {
        displayAsUser: string
        url: string
        message: SendMessageOptions
      }
    }

    internalServer: {
      type: "express" | "fastify" = "express"
      endpoint: string = "/dblwebhook"
      port: number = 6815,
      middleware: (req, res, next) => any
    }
  }

  class TopGG {
    constructor(public options: Options)
    client: Client
    webhook: Webhook
    bots: BotsManager
    readonly bot: BotsManager
    reviews: ReviewsManager
    autoPoster?: AutoPoster

    fetchUser(id: Snowflake): TopGGUser
    request(method: "GET" | "POST" | "DELETE", route: string, options: any): Promise<any>
  }

  export = TopGG
  export { TopGG }

  export class Webhook {
    constructor(public manager: TopGG)
    middleware(type: "express" | "fastify"): (req, res, next) => void
    middleware(req, res, next): void
  }

  export class AutoPoster extends EventEmitter {
    constructor(public manager: TopGG)
    readonly interval: NodeJS.Timeout
    start(post: boolean = true): Promise<true>
    stop(): void
    waitReady(): Promise<void>
    on(event: "post", listener: (stats: Omit<BotStats, "shards">) => void): this
  }

  class Base { readonly manager: TopGG }
  export class BotsManager extends Base {
    readonly clientID: Snowflake
    fetch(id: Snowflake): Promise<Bot>
    fetch(options: BotQueryOptions): Promise<Collection<Snowflake, Bot> & { total: number }>
    search(query: string): Promise<Collection<Snowflake, Bot> & { total: number }>
    fetchVotes(): Promise<Collection<Snowflake, BaseUser>>
    hasVoted(userID: Snowflake): Promise<boolean>
    fetchStats(): Promise<BotStats>
    postStats(stats?: Omit<BotStats, "shards">): Promise<Omit<BotStats, "shards">>
  }

  export class ReviewsManager extends Base {
    fetch(page: number = 1, id?: Snowflake): Promise<Collection<Snowflake, Review>>
    iterate(): AsyncGenerator<Review, Collection<Snowflake, Review>, Review>
    [Symbol.asyncIterator](): AsyncGenerator<Review, Collection<Snowflake, Review>, Review>
  }

  export class BaseUser extends Base {
    id: Snowflake
    username: string
    discriminator: `${number}` // why not
    avatar?: string
    defaultAvatar: string
    user?: User
    readonly tag: string

    displayAvatarURL(options?: { dynamic: boolean; format: string; size: number }): string
    fetchUser(): Promise<User>
  }

  export class Bot extends BaseUser {
    library: string
    prefix: string
    shortDescription: string
    longDescription: string
    tags: string[]
    website?: string
    supportInvite: string
    github?: string
    invite: string
    owners: Snowflake[]
    featuredGuilds: Snowflake[]
    shards: number[]
    approvedTimestamp: number
    certified: boolean
    vanity?: string
    votes: number
    monthlyVotes: number
    serverCount: number
    shardCount: number
    donateBotGuildID?: Snowflake

    readonly approvedAt: Date
    readonly me: boolean
    generateInvite(options: { guildID: Snowflake; scope: string[] }): string
    fetchReviews(page: number = 1): Promise<Collection<Snowflake, Review>>
    fetchStats(): Promise<BotStats>
  }

  export class Review extends Base {
    id: Snowflake
    content: string
    botID: Snowflake
    score: number
    votes: number
    createdTimestamp: number
    flagged: boolean
    flaggedTimestamp?: number
    authorID: Snowflake
    posterID: Snowflake
    posterUsername: Snowflake
    posterAvatar: string
    reply?: ReviewReply
    readonly stars: 1 | 2 | 3 | 4 | 5
    readonly createdAt: Date
    readonly flaggedAt: Date
  }

  export class TopGGUser extends BaseUser {
    bio: string
    banner?: string
    color?: number
    supporter: boolean
    certified: boolean
    moderator: boolean
    websiteModerator: boolean
    admin: boolean
    socials: {
      youtube?: string
      reddit?: string
      twitter?: string
      instagram?: string
      github?: string
    }
    readonly hexColor: string
  }

  export { TopGGUser as User }

  type BotFields = Omit<Bot, "manager">
  interface BotQueryOptions {
    limit: number
    offset: number
    sort: keyof BotFields
    fields: Array<keyof BotFields>
    search: BotFields
  }

  interface BotStats {
    serverCount: number
    shardCount: number
    shards: number[]
  }

  interface ReviewReply {
    id: Snowflake
    content: string
    authorID: Snowflake
  }
}