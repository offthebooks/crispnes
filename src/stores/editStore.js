import { DrawTools, Tools } from '../consts.js'
import { Render } from '../render.js'
import {
  clamp,
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys,
  diffObjectValues,
  domQueryOne,
  forElements,
  removeClass
} from '../utils.js'
import { Store } from './store.js'

const maxZoomLevel = 256
const tileEditorSide = 4
export const tileEditorGridSize = tileEditorSide * tileEditorSide

const editCanvas = domQueryOne('#editor canvas')

const defaultData = Object.seal({
  zoomLevel: 1,
  currentTool: Tools.Draw
})

export class EditStore {
  #data
  #drawOperation

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
  }

  init() {
    this.renderCanvas()
    this.zoom = 1
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
    // return this.bank === Bank.Background
    //   ? this.#data.backgroundEditTiles
    //   : this.#data.spriteEditTiles
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
    const editTiles = this.#editTiles
    const nextAvailable = editTiles.indexOf(-1)

    if (nextAvailable === -1) return

    editTiles[nextAvailable] = tileIndex
    this.serialize()
    Render.setDirty()
  }

  removeTile(editTileIndex) {
    this.#editTiles[editTileIndex] = -1
    this.serialize()
    Render.setDirty()
  }

  clearTile(editTileIndex) {
    const tile = this.tileForEditTile(editTileIndex)
    const { tileStore } = Store.context
    tile.clear()
    tileStore.serialize(tileStore.tilesetSlice)
    Render.setDirty()
  }

  editAt({ x, y }) {
    const { frame } = Store.context.animationStore
    const { colorIndex: paletteColor } = Store.context.paletteStore
    switch (this.tool) {
      case Tools.Draw:
        const color = frame.toggle(x, y, paletteColor)
        this.#drawOperation = { x, y, color }
        break
      case Tools.Fill:
        if (!frame.fill(x, y, paletteColor)) return
        break
      default:
        return
    }
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
    return this.#data.currentTool
  }

  set tool(tool) {
    if (tool === this.tool || !DrawTools.has(tool)) return

    this.#data.currentTool = tool
    forElements('#tools .active', removeClass('active'))
    domQueryOne(`[data-tool="${tool}"]`).classList.add('active')

    Render.setDirty()
  }

  get zoom() {
    return this.#data.zoomLevel
  }

  set zoom(scalar) {
    const { width: w, height: h } = Store.context.animationStore.frame
    const zoom = clamp(this.zoom * scalar, maxZoomLevel, 1)
    this.#data.zoomLevel = zoom
    editCanvas.style.transform = `translate(${-w / 2}px, ${-h / 2}px)`
    editCanvas.style.transform += `scale(${zoom})`
  }

  zoomIn() {
    this.zoom = 2
  }

  zoomOut() {
    this.zoom = 0.5
  }

  renderCanvas() {
    const { palette } = Store.context.paletteStore
    const { frame } = Store.context.animationStore

    editCanvas.width = frame.width
    editCanvas.height = frame.height

    const context = editCanvas.getContext('2d')
    const imageData = frame.generateImageDataWithPalette(palette)
    context.putImageData(imageData, 0, 0)
  }

  // Other input management
  finishEdit() {
    // This needs to store edited tiles data to previous
    // in the eventual "undo" operation stack, probably
    // saving that in #drawOperation as well
    this.#drawOperation = null
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    return dataFromStorageWithKeys(Object.keys(defaultData))
  }
}
