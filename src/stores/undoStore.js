const actionLimit = 50

export class UndoStore {
  #undoActions
  #redoActions

  constructor() {
    this.#undoActions = []
    this.#redoActions = []
  }

  get nextUndo() {
    const undo = this.#undoActions
    return undo.length ? `Undo ${undo.at(-1).name}` : null
  }

  get nextRedo() {
    const redo = this.#redoActions
    return redo.length ? `Redo ${redo.at(-1).name}` : null
  }

  // Stack operations
  record(action) {
    this.#undoActions.push(action)
    if (this.#undoActions.length > this.actionLimit) this.#undoActions.shift()
    this.#redoActions = []
  }

  undo() {
    const action = this.#undoActions.pop()
    if (!action) return
    action.undo()
    this.#redoActions.push(action)
  }

  redo() {
    const action = this.#redoActions.pop()
    if (!action) return
    action.redo()
    this.#undoActions.push(action)
  }
}
