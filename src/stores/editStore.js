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
      case Tools.Draw: {
        const before = frame.read(x, y)
        const after = frame.toggle(x, y, paletteColor)
        if (before === after) return
        this.#drawOperation = { after, [this.#keyForXY({ x, y })]: before }
        break
      }
      case Tools.Fill: {
        const fillOperation = frame.fill(x, y, paletteColor)
        if (!fillOperation) return
        this.#recordFill(fillOperation)
        break
      }
      default:
        return
    }

    this.#renderCanvas()
  }

  continueEdit({ x, y }) {
    if (!this.#drawOperation) return

    const { frame } = Store.context.animationStore
    const { after } = this.#drawOperation
    const key = this.#keyForXY({ x, y })
    const before = frame.read(x, y)

    if (this.#drawOperation[key] || before === after) return

    this.#drawOperation[key] = before
    frame.draw(x, y, after)
    this.#renderCanvas()
  }

  clear() {
    const { frame } = Store.context.animationStore
    frame.clear()
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

  #keyForXY = ({ x, y }) => `${x},${y}`
  #xyForKey = (key) => {
    const [x, y] = key.split(',').map((n) => Number(n))
    return { x, y }
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

  #renderPixelList(pixels) {
    const { frame } = Store.context.animationStore
    pixels.forEach(({ x, y, color }) => frame.draw(x, y, color))
    this.#renderCanvas()
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

  // Commit draw operation, and capture undo action
  recordDraw() {
    if (!this.#drawOperation) return

    const { undoStore } = Store.context
    const { after, ...coords } = this.#drawOperation
    const beforePixels = Object.entries(coords).map(([key, before]) => ({
      ...this.#xyForKey(key),
      color: before
    }))
    const afterPixels = beforePixels.map((pixel) => ({
      ...pixel,
      color: after
    }))

    undoStore.record({
      name: 'Draw',
      undo: () => this.#renderPixelList(beforePixels),
      redo: () => this.#renderPixelList(afterPixels)
    })

    this.#drawOperation = null
  }

  #recordFill(fillOperation) {
    if (!fillOperation) return

    const { undoStore } = Store.context
    const { pixels, before, after } = fillOperation
    const beforePixels = pixels.map((pixel) => ({ ...pixel, color: before }))
    const afterPixels = pixels.map((pixel) => ({ ...pixel, color: after }))

    undoStore.record({
      name: 'Fill',
      undo: () => this.#renderPixelList(beforePixels),
      redo: () => this.#renderPixelList(afterPixels)
    })
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    return dataFromStorageWithKeys(Object.keys(defaultData))
  }
}
