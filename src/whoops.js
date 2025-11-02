import { formatJSON } from './utils.js'

class MissingArgumentError extends Error {
  constructor(arg) {
    super(`Missing required argument: ${arg}`)
    this.name = 'MissingArgumentError'
  }
}

class InvalidOperationError extends Error {
  constructor(msg) {
    super(`Invalid operation: ${msg}`)
    this.name = 'InvalidOperationError'
  }
}

class IncompleteEditBufferError extends Error {
  constructor(change) {
    const { index, before } = change
    const missing = before === undefined ? 'before' : 'after'
    super(`Missing '${missing}' value for buffer edit at index: ${index}`)
    this.name = 'IncompleteEditBufferError'
  }
}

class FinalizedEditBufferError extends Error {
  constructor(change) {
    super(
      `Attempt to modify finalized buffer edit with change:\n${formatJSON(change)}`
    )
    this.name = 'FinalizedEditBufferError'
  }
}

class EditBufferReadError extends Error {
  constructor(type) {
    super(
      `Attempt to read ${type} values for a buffer edit that is not finalized.`
    )
    this.name = 'EditBufferReadError'
  }
}

export class Whoops extends Error {
  static missingArgument = (arg) => new MissingArgumentError(arg)
  static invalidOperation = (msg) => new InvalidOperationError(msg)

  static incompleteEditBuffer = (change) =>
    new IncompleteEditBufferError(change)
  static finalizedEditBuffer = (change) => new FinalizedEditBufferError(change)
  static editBufferRead = (type) => new EditBufferReadError(type)
}
