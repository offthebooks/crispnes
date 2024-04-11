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
  // #data
  #drawOperation
  #currentTool

  constructor(editData) {
    Object.assign(editData, defaultData)
    this.#currentTool = Tools.Draw
  }

  // Accessors
  get mode() {
    return Store.context.getDataForKeyPath('edit.selectedMode')
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
    const { getDataForKeyPath } = Store.context
    return Store.context.getDataForKeyPath(this.#editTilesKeyPath)
  }

  get #editTilesKeyPath() {
    return this.bank === Bank.Background
      ? 'edit.backgroundEditTiles'
      : 'edit.spriteEditTiles'
  }

  tileIndexForEditTile(editTile) {
    return this.#editTiles[editTile]
  }

  tileForEditTile(editTile) {
    const { tileset } = Store.context.tileStore
    return tileset.tile(this.tileIndexForEditTile(editTile))
  }

  // Mutations
  editTileMutation(editTile, tileIndex) {
    return { [`${this.#editTilesKeyPath}.${editTile}`]: tileIndex }
  }

  addTile(tileIndex) {
    const editTiles = this.#editTiles
    const nextAvailable = editTiles.indexOf(-1)

    if (nextAvailable === -1) return

    const mutation = this.editTileMutation(nextAvailable, tileIndex)
    Store.context.perform('Set Edit Tile', mutation)
  }

  removeTile(editTile) {
    const mutation = this.editTileMutation(editTile, -1)
    Store.context.perform('Unlink Edit Tile', mutation)
  }

  clearTile(editTileIndex) {
    const tile = this.tileForEditTile(editTileIndex)
    const { tileStore } = Store.context
    tile.clear()
    tileStore.serialize(tileStore.tilesetSlice)
    Render.setDirty()
  }

  editAt({ editTileIndex, x, y }) {
    const tile = this.tileForEditTile(editTileIndex)
    const { colorIndex: paletteColor } = Store.context.paletteStore
    const { tileStore } = Store.context
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
    tileStore.serialize(tileStore.tilesetSlice)
    Render.setDirty()
  }

  continueEdit({ editTileIndex, x, y }) {
    if (!this.#drawOperation) return

    const { x: prevX, y: prevY, color } = this.#drawOperation
    if (x === prevX && y === prevY) return

    Object.assign(this.#drawOperation, { x, y })

    const { tileStore } = Store.context
    const tile = this.tileForEditTile(editTileIndex)
    if (color === tile.read(x, y)) return
    tile.draw(x, y, color)
    tileStore.serialize(tileStore.tilesetSlice)
    Render.setDirty()
  }

  get tool() {
    return this.#currentTool
  }

  set tool(tool) {
    if (tool === this.#currentTool) return
    this.#currentTool = tool
    Render.setDirty()
  }

  // Other input management
  finishEdit() {
    // This needs to store edited tiles data to previous
    // in the eventual "undo" operation stack, probably
    // saving that in #drawOperation as well
    this.#drawOperation = null
  }
}
