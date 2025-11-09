import { Tool } from '../consts.js'
import { domQueryOne } from '../utils.js'

const actionLimit = 50
const undoTool = domQueryOne(`[data-tool="${Tool.Undo}"]`)
const redoTool = domQueryOne(`[data-tool="${Tool.Redo}"]`)

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
    if (this.#undoActions.length > actionLimit) this.#undoActions.shift()
    this.#redoActions = []
    this.#renderToolState()
  }

  undo() {
    const action = this.#undoActions.pop()
    if (!action) return
    action.undo()
    this.#redoActions.push(action)
    this.#renderToolState()
  }

  redo() {
    const action = this.#redoActions.pop()
    if (!action) return
    action.redo()
    this.#undoActions.push(action)
    this.#renderToolState()
  }

  #renderToolState() {
    const { nextUndo, nextRedo } = this
    undoTool.classList[nextUndo ? 'remove' : 'add']('inactive')
    redoTool.classList[nextRedo ? 'remove' : 'add']('inactive')
    undoTool.querySelector('span.tip').innerHTML = nextUndo ?? ''
    redoTool.querySelector('span.tip').innerHTML = nextRedo ?? ''
  }
}
