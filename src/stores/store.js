import { EditStore } from './editStore.js'
import { PaletteStore } from './paletteStore.js'

export class Store {
  static #context = {}

  static init() {
    const ctxt = this.context

    // Constructors should be empty, this hooks up the objects
    // so that all managers are present in their init functions
    // and available to other dependencies
    Object.assign(ctxt, {
      editStore: new EditStore(),
      paletteStore: new PaletteStore()
    })
  }

  static get context() {
    return this.#context
  }
}
