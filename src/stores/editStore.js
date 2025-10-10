import { DrawTools, Tools } from '../consts.js'
import {
  clamp,
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys,
  domQueryOne,
  forElements,
  removeClass,
  restyle
} from '../utils.js'
import { Store } from './store.js'

const maxZoomLevel = 256
const tileEditorSide = 4
export const tileEditorGridSize = tileEditorSide * tileEditorSide

const editContainer = domQueryOne('#editContainer')
const editCanvas = domQueryOne('#editor canvas')

const defaultData = Object.seal({
  pan: { x: 0, y: 0 },
  zoomLevel: 16,
  currentTool: Tools.Draw
})

export class EditStore {
  #data
  #drawOperation

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
  }

  init() {
    this.#renderCanvas()
    this.#positionContainer()
  }

  // Mutations
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

    this.#renderCanvas()
  }

  continueEdit({ x, y }) {
    if (!this.#drawOperation) return

    const { x: prevX, y: prevY, color } = this.#drawOperation
    if (x === prevX && y === prevY) return

    Object.assign(this.#drawOperation, { x, y })

    const { frame } = Store.context.animationStore
    if (color === frame.read(x, y)) return
    frame.draw(x, y, color)
    this.#renderCanvas()
  }

  get tool() {
    return this.#data.currentTool
  }

  set tool(tool) {
    if (tool === this.tool || !DrawTools.has(tool)) return

    this.#data.currentTool = tool
    forElements('#tools .active', removeClass('active'))
    domQueryOne(`[data-tool="${tool}"]`).classList.add('active')
  }

  get zoom() {
    return this.#data.zoomLevel
  }

  set zoom(scalar) {
    const zoom = clamp(this.zoom * scalar, maxZoomLevel, 1)
    this.#data.zoomLevel = zoom
    this.#positionContainer()
  }

  zoomIn() {
    this.zoom = 2
  }

  zoomOut() {
    this.zoom = 0.5
  }

  get pan() {
    return { ...this.#data.pan }
  }

  set pan({ x = 0, y = 0 }) {
    this.#data.pan.x += x
    this.#data.pan.y += y
    this.#positionContainer()
  }

  #positionContainer() {
    const { width, height } = Store.context.animationStore.frame
    const { x, y } = this.pan
    const w = Math.floor(width * this.zoom)
    const h = Math.floor(height * this.zoom)

    restyle(editContainer, {
      width: `${w}px`,
      height: `${h}px`,
      marginLeft: `${x - ~~(w / 2)}px`,
      marginTop: `${y - ~~(h / 2)}px`
    })
  }

  #renderCanvas() {
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
