import { EditStore } from './editStore.js'
import { FileStore } from './fileStore.js'
import { PaletteStore } from './paletteStore.js'
import { AnimationStore } from './animationStore.js'
import { UndoStore } from './undoStore.js'
import { DataStore } from './dataStore.js'

export class Store {
  static #context = {}

  static async init() {
    // Constructors should only set internal state, this hooks up
    // the objects so that all managers are present in their init
    // functions and available to other dependencies, sequence matters
    // here for deserialization in the awaited init methods below
    Object.assign(this.#context, {
      dataStore: new DataStore(),
      editStore: new EditStore(),
      fileStore: new FileStore(),
      paletteStore: new PaletteStore(),
      animationStore: new AnimationStore(),
      undoStore: new UndoStore()
    })

    Object.freeze(this.#context)

    for (const store of Object.values(this.#context)) {
      await store?.init?.()
    }
  }

  static get context() {
    return this.#context
  }
}
