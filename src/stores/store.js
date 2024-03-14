import { EditStore } from './editStore.js'
import { PaletteStore } from './paletteStore.js'
import { TileStore } from './tileStore.js'

export class Store {
  static #context = {}

  static init() {
    const ctxt = this.context

    // Constructors should be empty, this hooks up the objects
    // so that all managers are present in their init functions
    // and available to other dependencies
    Object.assign(ctxt, {
      editStore: new EditStore(),
      paletteStore: new PaletteStore(),
      tileStore: new TileStore()
    })
  }

  static get context() {
    return this.#context
  }
}
