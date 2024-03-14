import { Bank, EditMode } from '../enums.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys
} from '../utils.js'

const defaultData = Object.seal({
  selectedMode: EditMode.BackgroundTiles,

  spriteEditTiles: [],
  backgroundEditTiles: []
})

export class EditStore {
  #data

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
  }

  // Accessors
  get mode() {
    return this.#data.selectedMode
  }

  get bank() {
    switch (this.mode) {
      case EditMode.SpriteTiles:
      case EditMode.MetaSprites:
        return Bank.Sprite
      default:
        return Bank.Background
    }
  }

  get editTiles() {
    return this.bank === Bank.Background ? backgroundEditTiles : spriteEditTiles
  }

  // Mutations
  selectMode(selectedMode) {
    const changed = diffObjectValues({ selectedMode }, this.#data)
    this.serialize(changed.next)
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    const data = dataFromStorageWithKeys(Object.keys(defaultData))
    return data
  }
}
