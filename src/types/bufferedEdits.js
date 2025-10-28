import { Whoops } from '../whoops.js'

export class BufferedEdits {
  #global // {before?: primitive, after?: primitive}
  #edits // {[index: integer]: {before: primitive, after: primitive}, ...}
  #finalized

  constructor(global = {}) {
    this.#global = Object.freeze({ ...global })
    this.#edits = {}
    this.#finalized = false
  }

  finalize() {
    Object.freeze(this.#edits)
    this.#finalized = true
    return Object.keys(this.#edits).length > 0
  }

  editIndex(index, values = {}) {
    const change = { index, ...this.#global, ...values }

    if (this.#finalized) throw Whoops.finalizedBufferedEdits(change)

    if (change.before === undefined || change.after === undefined)
      throw Whoops.incompleteBufferedEdits(change)

    this.#edits[index] = values
  }

  valuesForIndex(index) {
    return { ...this.#edits[index] }
  }

  get before() {
    return this.#global.before
  }

  get after() {
    return this.#global.after
  }

  get beforeValues() {
    if (!this.#finalized) throw Whoops.bufferedEditsRead('before')

    return Object.entries(this.#edits).map(([index, { before }]) => [
      index,
      before ?? this.#global.before
    ])
  }

  get afterValues() {
    if (!this.#finalized) throw Whoops.bufferedEditsRead('after')

    return Object.entries(this.#edits).map(([index, { after }]) => [
      index,
      after ?? this.#global.after
    ])
  }
}
