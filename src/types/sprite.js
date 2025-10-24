import { Store } from '../stores/store.js'
import { clamp } from '../utils.js'
export const maxSideLength = 256
export const minSideLength = 8

const defaultModel = {
  bytes: null,
  animation: null,
  duration: 10 // frames at 60hz
}

export class Sprite {
  #model

  constructor(model) {
    this.#model = { ...defaultModel, ...model }
    this.#model.bytes || this.clear()
  }

  static fromDataModel = ({ animation, duration, bytes }) => {
    const { animationStore } = Store.context
    return new Sprite({
      animation: animationStore.animationForName(animation),
      duration,
      bytes
    })
  }

  get dataModel() {
    const { animation, duration, bytes } = this.#model
    return {
      animation: animation.name,
      index: animation.indexOfFrame(this),
      bytes: new Uint8Array(bytes),
      duration
    }
  }

  get width() {
    return this.#model.animation.width
  }

  get height() {
    return this.#model.animation.height
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
  }

  clear() {
    this.#model.bytes = new Uint8Array(this.width * this.height)
  }

  read(x, y) {
    return this.#model.bytes[this.#index(x, y)]
  }

  draw(x, y, val) {
    this.#write(x, y, val)
  }

  fill(x, y, val) {
    const match = this.read(x, y)
    if (val === match) return null

    const pixels = this.#flood(x, y, val, match)
    return pixels.length
      ? {
          pixels,
          before: match,
          after: val
        }
      : null
  }

  toggle(x, y, val) {
    // If we're setting a matching color, toggle to background color
    const outColor = val === this.read(x, y) ? 0 : val
    this.#write(x, y, outColor)
    return outColor
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

  #index(x, y) {
    return y * this.width + x
  }

  #write(x, y, val) {
    this.#model.bytes[this.#index(x, y)] = val
  }

  #flood(x, y, val, match) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return []

    if (this.read(x, y) !== match) return []

    this.#write(x, y, val)
    return [
      { x, y },
      ...this.#flood(x + 1, y, val, match),
      ...this.#flood(x - 1, y, val, match),
      ...this.#flood(x, y + 1, val, match),
      ...this.#flood(x, y - 1, val, match)
    ]
  }
}
