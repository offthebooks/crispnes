import { DrawTools, Tools } from '../consts.js'
import { BufferedEdits } from '../types/bufferedEdits.js'
import {
  clamp,
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys,
  domQueryOne,
  forElements,
  removeClass,
  restyle
} from '../utils.js'
import { DataStore } from './dataStore.js'
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
  #drawEdits

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
    this.#drawEdits = null
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
        this.#drawEdits = new BufferedEdits({ after })
        this.#drawEdits.editIndex(frame.indexAt(x, y), { before })
        break
      }
      case Tools.Fill: {
        const fillEdits = frame.fill(x, y, paletteColor)
        if (!fillEdits) return
        this.#recordFill(fillEdits)
        break
      }
      default:
        return
    }

    this.#renderCanvas()
  }

  continueEdit({ x, y }) {
    debugger
    if (!this.#drawEdits) return
    debugger
    const { frame } = Store.context.animationStore
    const { after } = this.#drawEdits
    const index = frame.indexAt(x, y)
    const before = frame.read(x, y)

    if (this.#drawEdits.valuesForIndex(index) || before === after) return

    this.#drawEdits.editIndex(index, { before })
    frame.draw(x, y, after)
    this.#renderCanvas()
  }

  clear() {
    const { undoStore, animationStore } = Store.context
    const { frame } = animationStore
    const { bytes } = frame
    const setBytes = (bytes) => {
      bytes ? frame.setBytes(bytes) : frame.clear()
      frame.persist()
      this.#renderCanvas()
    }
    undoStore.record({
      name: 'Clear',
      undo: () => setBytes(bytes),
      redo: () => setBytes(null)
    })
    setBytes(null)
  }

  get tool() {
    return this.#data.currentTool
  }

  set tool(tool) {
    if (tool === this.tool || !DrawTools.has(tool)) return

    this.#data.currentTool = tool
    forElements('#tools .selected', removeClass('selected'))
    domQueryOne(`[data-tool="${tool}"]`).classList.add('selected')
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

  #applyEdits(edits) {
    const {
      animationStore: { frame }
    } = Store.context
    frame.applyBufferedEdits(edits)
    frame.persist()
    this.#renderCanvas()
  }

  #renderCanvas() {
    const { frame } = Store.context.animationStore

    editCanvas.width = frame.width
    editCanvas.height = frame.height

    const context = editCanvas.getContext('2d')
    const imageData = frame.generateImageData()
    context.putImageData(imageData, 0, 0)
  }

  // Commit draw operation, and capture undo action
  recordDraw() {
    if (!this.#drawEdits) return

    this.#drawEdits.finalize()

    const {
      undoStore,
      animationStore: { frame }
    } = Store.context
    const { beforeValues, afterValues } = this.#drawEdits

    undoStore.record({
      name: 'Draw',
      undo: () => this.#applyEdits(beforeValues),
      redo: () => this.#applyEdits(afterValues)
    })

    frame.persist()
    this.#drawEdits = null
  }

  #recordFill(fillEdits) {
    if (!fillEdits) return

    const {
      undoStore,
      animationStore: { frame }
    } = Store.context
    const { beforeValues, afterValues } = fillOperation

    undoStore.record({
      name: 'Fill',
      undo: () => this.#applyEdits(beforeValues),
      redo: () => this.#applyEdits(afterValues)
    })

    frame.persist()
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    return dataFromStorageWithKeys(Object.keys(defaultData))
  }
}
