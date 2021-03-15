// for some reason i always have to sneak this file into every project i make :^)
const blank = () => {}
const methods = ["get", "post", "delete"]
const reflectors = [ // cause why not lol
  "toString",
  "valueOf",
  "inspect",
  "constructor",
  Symbol.toPrimitive,
  Symbol.for("nodejs.util.inspect.custom")
]

/**
 * @param {(method: "GET" | "POST" | "DELETE", route: string, options: Object)} handleRequest
 */
module.exports = function Request(handleRequest = () => {}) {
  const route = [""]
  const handler = {
    get(_, name) {
      route.push(name)
      return new Proxy(blank, handler)
    },
    apply(_target, _, args) {
      const method = route.pop()
      if (reflectors.includes(method)) return route.join("/")
      if (methods.includes(method)) return handleRequest(method.toUpperCase(), route.join("/"), args[0])
      route.push(...[method].concat(args).filter(x => x != null))
      return new Proxy(blank, handler)
    }
  }
  return new Proxy(blank, handler)
}