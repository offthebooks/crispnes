import { EditStore } from './editStore.js'
import { FileStore } from './fileStore.js'
import { PaletteStore } from './paletteStore.js'
import { AnimationStore } from './animationStore.js'

export class Store {
  static #context = {}

  static init() {
    // Constructors should only set internal state, this hooks up
    // the objects so that all managers are present in their init
    // functions and available to other dependencies
    Object.assign(this.#context, {
      editStore: new EditStore(),
      fileStore: new FileStore(),
      paletteStore: new PaletteStore(),
      animationStore: new AnimationStore()
    })

    Object.freeze(this.#context)

    Object.values(this.#context).forEach((store) => store?.init?.())
  }

  static get context() {
    return this.#context
  }
}
