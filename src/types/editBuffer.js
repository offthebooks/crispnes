import { Whoops } from '../whoops.js'

export class EditBuffer {
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

    if (this.#finalized) throw Whoops.finalizedEditBuffer(change)

    if (change.before === undefined || change.after === undefined)
      throw Whoops.incompleteEditBuffer(change)

    this.#edits[index] = values
  }

  valuesForIndex(index) {
    const edits = this.#edits[index] ?? null
    return edits && { ...edits }
  }

  get before() {
    return this.#global.before
  }

  get after() {
    return this.#global.after
  }

  get beforeValues() {
    if (!this.#finalized) throw Whoops.editBufferRead('before')

    return Object.entries(this.#edits).map(([index, { before }]) => [
      index,
      before ?? this.#global.before
    ])
  }

  get afterValues() {
    if (!this.#finalized) throw Whoops.editBufferRead('after')

    return Object.entries(this.#edits).map(([index, { after }]) => [
      index,
      after ?? this.#global.after
    ])
  }
}
