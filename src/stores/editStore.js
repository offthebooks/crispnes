import { Bank, EditMode } from '../enums.js'
import { EditTile } from '../types/editTile.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys,
  diffObjectValues
} from '../utils.js'

const maxEditTiles = 36
const sqrtMaxTiles = Math.ceil(Math.sqrt(maxEditTiles))
const snapTilePixels = 8

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
    return this.bank === Bank.Background
      ? this.#data.backgroundEditTiles
      : this.#data.spriteEditTiles
  }

  // Mutations
  selectMode(selectedMode) {
    const changed = diffObjectValues({ selectedMode }, this.#data)
    this.serialize(changed.next)
  }

  tileAt(x, y) {
    return this.editTiles.find((et) => et.x === x && et.y === y)
  }

  addTile(tileIndex) {
    if (this.editTiles.length >= maxEditTiles) return

    let x, y
    for (let cy = 0; x === undefined; ++cy) {
      for (let cx = 0; cx < sqrtMaxTiles; ++cx) {
        if (!this.tileAt(cx, cy)) {
          x = cx
          y = cy
          break
        }
      }
    }

    this.editTiles.push(new EditTile(tileIndex, x, y))
    this.serialize()
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
