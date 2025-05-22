import { EditStore } from './editStore.js'
import { FileStore } from './fileStore.js'
import { PaletteStore } from './paletteStore.js'
import { AnimationStore } from './animationStore.js'

export class Store {
  static #context = {}

  static init() {
    const ctxt = this.context

    // Constructors should be empty, this hooks up the objects
    // so that all managers are present in their init functions
    // and available to other dependencies
    Object.assign(ctxt, {
      editStore: new EditStore(),
      fileStore: new FileStore(),
      paletteStore: new PaletteStore(),
      animationStore: new AnimationStore()
    })
  }

  static get context() {
    return this.#context
  }
}
