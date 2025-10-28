import { formatJSON } from './utils.js'

class MissingArgumentError extends Error {
  constructor(arg) {
    super(`Missing required argument: ${arg}`)
    this.name = 'MissingArgumentError'
  }
}

class IncompleteBufferedEditsError extends Error {
  constructor(change) {
    const { index, before } = change
    const missing = before === undefined ? 'before' : 'after'
    super(`Missing '${missing}' value for buffer edit at index: ${index}`)
    this.name = 'IncompleteBufferedEditsError'
  }
}

class FinalizedBufferedEditsError extends Error {
  constructor(change) {
    super(
      `Attempt to modify finalized buffer edit with change:\n${formatJSON(change)}`
    )
    this.name = 'FinalizedBufferedEditsError'
  }
}

class BufferedEditsReadError extends Error {
  constructor(type) {
    super(
      `Attempt to read ${type} values for a buffer edit that is not finalized.`
    )
    this.name = 'BufferedEditsReadError'
  }
}

export class Whoops extends Error {
  static missingArgument = (arg) => new MissingArgumentError(arg)

  static incompleteBufferedEdits = (change) =>
    new IncompleteBufferedEditsError(change)
  static finalizedBufferedEdits = (change) =>
    new FinalizedBufferedEditsError(change)
  static bufferedEditsRead = (type) => new BufferedEditsReadError(type)
}
