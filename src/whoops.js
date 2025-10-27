class MissingArgumentError extends Error {
  constructor(arg) {
    super(`Missing required argument: ${name}`)
    this.name = 'MissingArgumentError'
  }
}

export class Whoops extends Error {
  static missingArgument = (arg) => new MissingArgumentError(arg)
}
