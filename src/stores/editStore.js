import { Bank, EditMode } from '../enums.js'
import { Render } from '../render.js'
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

  tileWithIndex(tileIndex) {
    return this.editTiles.find((et) => et.tileIndex === tileIndex)
  }

  addTile(tileIndex) {
    const { editTiles } = this
    if (editTiles.length >= maxEditTiles || this.tileWithIndex(tileIndex))
      return

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

    editTiles.push(new EditTile(tileIndex, x, y))
    this.serialize()
    Render.setDirty()
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    const data = dataFromStorageWithKeys(Object.keys(defaultData))

    const { spriteEditTiles, backgroundEditTiles } = data

    if (spriteEditTiles)
      data.spriteEditTiles = spriteEditTiles.map((et) =>
        Object.assign(new EditTile(0, 0, 0), et)
      )
    if (backgroundEditTiles)
      data.backgroundEditTiles = backgroundEditTiles.map((et) =>
        Object.assign(new EditTile(0, 0, 0), et)
      )

    return data
  }
}
