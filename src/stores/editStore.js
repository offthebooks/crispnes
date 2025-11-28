import { DrawTools, Tool } from '../consts.js'
import { EditBuffer } from '../types/editBuffer.js'
import {
  clamp,
  domQueryOne,
  forElements,
  removeClass,
  restyle,
  stripNullish
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
  currentTool: Tool.Draw
})

export class EditStore {
  #data
  #drawEdits
  #fillEdits

  get drawEdits() {
    return this.#drawEdits
  }

  constructor() {
    this.#data = { ...defaultData }
    this.#drawEdits = null
    this.#fillEdits = null
  }

  init() {
    this.renderCanvas()
    this.positionContainer()
  }

  // Mutations
  editAt({ x, y }) {
    const { frame } = Store.context.animationStore
    const { colorIndex: paletteColor } = Store.context.paletteStore

    switch (this.tool) {
      case Tool.Draw: {
        const before = frame.read(x, y)
        const after = frame.toggle(x, y, paletteColor)
        if (before === after) return
        this.#drawEdits = new EditBuffer({ after })
        this.#drawEdits.editIndex(frame.indexAt(x, y), { before })
        break
      }
      case Tool.Erase: {
        const before = frame.read(x, y)
        this.#drawEdits = new EditBuffer({ after: 0 })
        if (before !== 0) {
          frame.draw(x, y, 0)
          this.#drawEdits.editIndex(frame.indexAt(x, y), { before })
        }
        break
      }
      case Tool.Fill: {
        this.#fillEdits = frame.fill(x, y, paletteColor)
        break
      }
      default:
        return
    }

    this.renderCanvas()
  }

  continueEdit({ x, y }) {
    if (!this.#drawEdits) return
    const { frame } = Store.context.animationStore
    const { after } = this.#drawEdits
    const index = frame.indexAt(x, y)
    const before = frame.read(x, y)

    if (this.#drawEdits.valuesForIndex(index) || before === after) return

    this.#drawEdits.editIndex(index, { before })
    frame.draw(x, y, after)
    this.renderCanvas()
  }

  cancelEdit() {
    const editBuffers = stripNullish([this.#drawEdits, this.#fillEdits])
    if (!editBuffers.length) return

    const { frame } = Store.context.animationStore
    editBuffers.forEach((buffer) => {
      buffer.finalize()
      const { beforeValues: edits } = buffer
      this.#applyEdits({ frame, edits, persist: false })
    })

    this.#drawEdits = null
    this.#fillEdits = null
  }

  clear() {
    const { undoStore, animationStore } = Store.context
    const { frame } = animationStore
    const { bytes } = frame
    const setBytes = (bytes) => {
      bytes ? frame.setBytes(bytes) : frame.clear()
      frame.persist()
      this.renderCanvas()
    }
    undoStore.record({
      name: 'clear',
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
    this.positionContainer()
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
    this.positionContainer()
  }

  positionContainer() {
    const { width, height } = Store.context.animationStore.animation
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

  #applyEdits({ frame, edits, persist = true }) {
    frame.applyEdits(edits)
    persist && frame.persist()
    this.renderCanvas()
  }

  renderCanvas() {
    const { frame } = Store.context.animationStore
    frame.addRenderCanvas(editCanvas)
  }

  recordEdit() {
    if (this.#drawEdits) this.#recordDraw()
    if (this.#fillEdits) this.#recordFill()
  }

  // Commit draw operation, and capture undo action
  #recordDraw() {
    this.#drawEdits.finalize()

    const {
      undoStore,
      animationStore: { frame }
    } = Store.context
    const { beforeValues, afterValues } = this.#drawEdits

    undoStore.record({
      name: this.tool === Tool.Draw ? 'draw' : 'erase',
      undo: () => this.#applyEdits({ frame, edits: beforeValues }),
      redo: () => this.#applyEdits({ frame, edits: afterValues })
    })

    frame.persist()
    this.#drawEdits = null
  }

  #recordFill() {
    const {
      undoStore,
      animationStore: { frame }
    } = Store.context
    const { beforeValues, afterValues } = this.#fillEdits

    undoStore.record({
      name: 'fill',
      undo: () => this.#applyEdits({ frame, edits: beforeValues }),
      redo: () => this.#applyEdits({ frame, edits: afterValues })
    })

    frame.persist()
    this.#fillEdits = null
  }
}
