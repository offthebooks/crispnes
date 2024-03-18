import { Bank, EditMode } from '../enums.js'
import { Render } from '../render.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys,
  diffObjectValues
} from '../utils.js'

const tileEditorSide = 4
export const tileEditorGridSize = tileEditorSide * tileEditorSide

const defaultData = Object.seal({
  selectedMode: EditMode.BackgroundTiles,

  spriteEditTiles: new Array(tileEditorGridSize).fill(-1),
  backgroundEditTiles: new Array(tileEditorGridSize).fill(-1)
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
    return this.bank === Bank.Background
      ? this.#data.backgroundEditTiles
      : this.#data.spriteEditTiles
  }

  // Mutations
  selectMode(selectedMode) {
    const changed = diffObjectValues({ selectedMode }, this.#data)
    this.serialize(changed.next)
  }

  addTile(tileIndex) {
    const { editTiles } = this
    const nextAvailable = editTiles.indexOf(-1)

    if (nextAvailable === -1) return

    editTiles[nextAvailable] = tileIndex
    this.serialize()
    Render.setDirty()
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    return dataFromStorageWithKeys(Object.keys(defaultData))
  }
}
