import { Store } from '../stores/store.js'
import { describeType, isCanvas } from '../utils.js'
import { Whoops } from '../whoops.js'
import { EditBuffer } from './editBuffer.js'
export const maxSideLength = 256
export const minSideLength = 8

const defaultModel = {
  bytes: null,
  animation: null,
  duration: 5 // frames at 60hz
}

export class Sprite {
  #model

  constructor(model = {}) {
    this.#model = { ...model }
    this.#model.duration ??= defaultModel.duration
    if (!this.#model.animation) throw Whoops.missingArgument('animation')
    if (!this.#model.bytes) this.clear()
  }

  // These are deserialized by their host animation
  // which hydrates the animation name to the class
  // instance. It could call the constructor directly,
  // but this is for consistency and future proofing.
  static fromDataModel = (model) => new Sprite(model)

  get dataModel() {
    const [animation, index] = this.dataIndex
    const { duration, bytes } = this.#model
    return {
      animation,
      index,
      bytes: new Uint8Array(bytes),
      duration
    }
  }

  get dataIndex() {
    return [this.animation.name, this.animation.indexOfFrame(this)]
  }

  get animation() {
    return this.#model.animation
  }

  get width() {
    return this.animation.width
  }

  get height() {
    return this.animation.height
  }

  get bytes() {
    new Uint8Array(this.#model.bytes)
  }

  get duration() {
    return this.#model.duration
  }

  set duration(d) {
    this.#model.duration = d
  }

  setBytes(bytes) {
    if (bytes.length !== this.#model.bytes.length) {
      console.error('Could not set bytes, array length mismatch.')
      return
    }
    this.#model.bytes = new Uint8Array(bytes)
    this.animation.markDirty()
  }

  clear() {
    this.#model.bytes = new Uint8Array(this.width * this.height)
    this.animation.markDirty()
  }

  read(x, y) {
    return this.#read(this.indexAt(x, y))
  }

  draw(x, y, val) {
    this.#writeAt(x, y, val)
  }

  fill(x, y, val) {
    const match = this.read(x, y)
    if (val === match) return null

    const edits = new EditBuffer({ before: match, after: val })
    const indices = this.#flood(x, y, val, match, edits)
    return edits.finalize() ? edits : null
  }

  toggle(x, y, val) {
    // If we're setting a matching color, toggle to background color
    const outColor = val === this.read(x, y) ? 0 : val
    this.#writeAt(x, y, outColor)
    return outColor
  }

  renderToCanvas(canvasEl) {
    if (!isCanvas(canvasEl))
      throw Whoops.invalidOperation(
        `Called renderToCanvas with ${describeType(canvasEl)}`
      )

    const { width, height } = this
    canvasEl.width = width
    canvasEl.height = height
    canvasEl.getContext('2d').putImageData(this.generateImageData(), 0, 0)
  }

  generateImageData() {
    const { palette } = this.#model.animation
    const imageData = new ImageData(this.width, this.height)
    const data = imageData.data
    let spriteIndex = 0
    let bufferIndex = 0
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const colIdx = this.#model.bytes[spriteIndex++]
        const { r, g, b, a } = palette.color(colIdx)
        data[bufferIndex++] = r
        data[bufferIndex++] = g
        data[bufferIndex++] = b
        data[bufferIndex++] = a
      }
    }
    return imageData
  }

  applyEdits(edits) {
    edits.forEach((edit) => this.#write(...edit))
  }

  persist() {
    const frames = [this.dataModel]
    Store.context.dataStore.save({ frames })
  }

  indexAt(x, y) {
    return y * this.width + x
  }

  #writeAt(x, y, val) {
    this.#write(this.indexAt(x, y), val)
  }

  #write(index, val) {
    this.#model.bytes[index] = val
    this.animation.markDirty()
  }

  #read(index) {
    return this.#model.bytes[index]
  }

  #flood(x, y, val, match, edits) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return

    const index = this.indexAt(x, y)

    if (this.#read(index) !== match) return

    this.#write(index, val)
    edits.editIndex(index)

    this.#flood(x + 1, y, val, match, edits),
      this.#flood(x - 1, y, val, match, edits),
      this.#flood(x, y + 1, val, match, edits),
      this.#flood(x, y - 1, val, match, edits)
  }
}
