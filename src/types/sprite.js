const xIndex = 3
const yIndex = 0
const tileIndex = 1
const attrIndex = 2
const paletteMask = 0b00000011
const hFlipMask = 0b01000000
const vFlipMask = 0b10000000
const priorityMask = 0b00100000

export class Sprite {
  #bytes

  constructor() {
    this.#bytes = new Int8Array[4]()
  }

  get x() {
    return this.#bytes[xIndex]
  }

  set x(value) {
    this.#bytes[xIndex] = value
  }

  get y() {
    return this.#bytes[yIndex]
  }

  set y(value) {
    this.#bytes[yIndex] = value
  }

  get tile() {
    return this.#bytes[tileIndex]
  }

  set tile(value) {
    this.#bytes[tileIndex] = value
  }

  get palette() {
    return this.#bytes[attrIndex] & paletteMask
  }

  set palette(value) {
    this.#bytes[attrIndex] &= ~paletteMask
    this.#bytes[attrIndex] |= value & paletteMask
  }

  get horizontalFlip() {
    return !!(this.#bytes[attrIndex] & hFlipMask)
  }

  set horizontalFlip(value) {
    this.#bytes[attrIndex] &= ~hFlipMask
    this.#bytes[attrIndex] |= value ? hFlipMask : 0
  }

  get verticalFlip() {
    return !!(this.#bytes[attrIndex] & vFlipMask)
  }

  set verticalFlip(value) {
    this.#bytes[attrIndex] &= ~vFlipMask
    this.#bytes[attrIndex] |= value ? vFlipMask : 0
  }

  get priority() {
    return !!(this.#bytes[attrIndex] & priorityMask)
  }

  set priority(value) {
    this.#bytes[attrIndex] &= ~priorityMask
    this.#bytes[attrIndex] |= value ? priorityMask : 0
  }
}
