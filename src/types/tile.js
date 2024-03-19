import { palToRGBA } from '../colors.js'

export const tileSideLengthPixels = 8
export const tileBytesPerPlane = 8
const tilePlanes = 2
export const tileSizeBytes = tileBytesPerPlane * tilePlanes

const hiBit = 0b10
const loBit = 0b01
const bit7 = 0b10000000

export class Tile {
  #plane0
  #plane1

  constructor(plane0, plane1) {
    this.#plane0 = plane0
    this.#plane1 = plane1
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
    for (let i = 0; i < 8; ++i) {
      this.plane0[i] = 0
      this.plane1[i] = 0
    }
  }

  read(x, y) {
    x = bit7 >>> x
    return (this.#plane0[y] & x ? loBit : 0) | (this.#plane1[y] & x ? hiBit : 0)
  }

  #write(x, y, val) {
    x = bit7 >>> x
    const mask = ~x
    // clear bit x in both planes
    this.#plane0[y] &= mask
    this.#plane1[y] &= mask
    // Set bit x from high/low bit in val
    if (val & loBit) this.#plane0[y] |= x
    if (val & hiBit) this.#plane1[y] |= x
  }

  #flood(x, y, val, match) {
    if (x < 0 || x > 7 || y < 0 || y > 7) return

    if (this.read(x, y) !== match) return

    this.#write(x, y, val)
    this.#flood(x + 1, y, val, match)
    this.#flood(x - 1, y, val, match)
    this.#flood(x, y + 1, val, match)
    this.#flood(x, y - 1, val, match)
  }

  generateImageDataWithPalette(palette, flipX = false, flipY = false) {
    const imageData = new ImageData(tileSideLengthPixels, tileSideLengthPixels)
    const data = imageData.data
    let bufferIndex = 0
    for (let y = 0; y < tileSideLengthPixels; ++y) {
      for (let x = 0; x < tileSideLengthPixels; ++x) {
        const curX = flipX ? tileSideLengthPixels - x : x
        const curY = flipY ? tileSideLengthPixels - y : y
        const colIdx = this.read(curX, curY)
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
