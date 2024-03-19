import { Bank, EditMode, Tools } from '../enums.js'
import { Render } from '../render.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys,
  diffObjectValues
} from '../utils.js'
import { Store } from './store.js'

const tileEditorSide = 4
export const tileEditorGridSize = tileEditorSide * tileEditorSide

const defaultData = Object.seal({
  selectedMode: EditMode.BackgroundTiles,

  spriteEditTiles: new Array(tileEditorGridSize).fill(-1),
  backgroundEditTiles: new Array(tileEditorGridSize).fill(-1)
})

export class EditStore {
  #data
  #drawOperation
  #currentTool

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
    this.#currentTool = Tools.Draw
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

  get #editTiles() {
    return this.bank === Bank.Background
      ? this.#data.backgroundEditTiles
      : this.#data.spriteEditTiles
  }

  tileIndexForEditTile(editTile) {
    return this.#editTiles[editTile]
  }

  tileForEditTile(editTile) {
    const { tileset } = Store.context.tileStore
    return tileset.tile(this.tileIndexForEditTile(editTile))
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

  editAt({ editTileIndex, x, y }) {
    const tile = this.tileForEditTile(editTileIndex)
    const { colorIndex: paletteColor } = Store.context.paletteStore
    switch (this.#currentTool) {
      case Tools.Draw:
        const color = tile.toggle(x, y, paletteColor)
        this.#drawOperation = { x, y, color }
        break
      case Tools.Fill:
        if (!tile.fill(x, y, paletteColor)) return
        break
      default:
        return
    }
    Render.setDirty()
  }

  continueEdit({ editTileIndex, x, y }) {
    if (!this.#drawOperation || this.#drawOperation.suspended) return

    const { x: prevX, y: prevY, color } = this.#drawOperation
    if (x === prevX && y === prevY) return

    Object.assign(this.#drawOperation, { x, y })

    const tile = this.tileForEditTile(editTileIndex)
    if (color === tile.read(x, y)) return
    tile.draw(x, y, color)
    Render.setDirty()
  }

  // Other input management
  finishEdit() {
    // This needs to store edited tiles data to previous
    // in the eventual "undo" operation stack, probably
    // saving that in #drawOperation as well
    this.#drawOperation = null
  }
  suspendEdit() {
    if (this.#drawOperation) this.#drawOperation.suspend = true
  }
  resumeEdit() {
    if (this.#drawOperation) this.#drawOperation.suspend = false
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    return dataFromStorageWithKeys(Object.keys(defaultData))
  }
}
