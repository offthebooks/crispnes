import { clamp } from '../utils.js'
export const maxSideLength = 256

export class Sprite {
  #bytes
  #width
  #height

  constructor(width, height) {
    this.#width = Math.floor(clamp(width, maxSideLength))
    this.#height = Math.floor(clamp(height, maxSideLength))
    this.clear()
  }

  toggle(x, y, val) {
    // If we're setting a matching color, toggle to background color
    const outColor = val === this.read(x, y) ? 0 : val
    this.#write(x, y, outColor)
    return outColor
  }

  fill(x, y, val) {
    const match = this.read(x, y)
    if (val === match) return false

    this.#flood(x, y, val, match)
    return true
  }

  draw(x, y, val) {
    this.#write(x, y, val)
  }

  clear() {
    this.#bytes = new Uint8Array[this.#width * this.#height]()
  }

  read(x, y) {
    return this.#bytes[this.#index(x, y)]
  }

  #index(x, y) {
    return y * this.#width + x
  }

  #write(x, y, val) {
    this.#bytes[this.#index(x, y)] = val
  }

  #flood(x, y, val, match) {
    if (x < 0 || x >= this.#width || y < 0 || y >= this.#height) return

    if (this.read(x, y) !== match) return

    this.#write(x, y, val)
    this.#flood(x + 1, y, val, match)
    this.#flood(x - 1, y, val, match)
    this.#flood(x, y + 1, val, match)
    this.#flood(x, y - 1, val, match)
  }

  generateImageDataWithPalette(palette) {
    const imageData = new ImageData(this.#width, this.#height)
    const data = imageData.data
    let spriteIndex = 0
    let bufferIndex = 0
    for (let y = 0; y < this.#height; ++y) {
      for (let x = 0; x < this.#width; ++x) {
        const colIdx = this.#bytes[spriteIndex++]
        const rgba = palToRGBA[palette[colIdx]]
        data[bufferIndex++] = (rgba & 0xff000000) >>> 24
        data[bufferIndex++] = (rgba & 0x00ff0000) >>> 16
        data[bufferIndex++] = (rgba & 0x0000ff00) >>> 8
        data[bufferIndex++] = rgba & 0x000000ff
      }
    }
    return imageData
  }
}
