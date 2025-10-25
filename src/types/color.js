import { hexStringForByte } from '../utils.js'

export class Color {
  #rgba

  constructor({ r, g, b, a = 255, gray, bytes }) {
    if (bytes instanceof Uint8Array && bytes.length === 4) {
      this.#rgba = bytes
      return
    }

    this.#rgba = new Uint8Array(4)
    this.r = gray ?? r ?? 0
    this.g = gray ?? g ?? 0
    this.b = gray ?? b ?? 0
    this.a = a
  }

  static fromRGB = (r, g, b, a) => new Color({ r, g, b, a })
  static fromGray = (gray, a) => new Color({ gray, a })
  static fromDataModel = (bytes) => new Color({ bytes })
  static cloneArray = (array) => array.map((c) => new Color({ bytes: c.#rgba }))

  get dataModel() {
    return new Uint8Array(this.#rgba)
  }

  get array() {
    return Object.freeze(Array.from(this.#rgba))
  }

  get hex() {
    const hexBytes = this.array.map(hexStringForByte)
    return ['#', ...hexBytes].join('')
  }

  get r() {
    return this.#rgba[0]
  }

  get g() {
    return this.#rgba[1]
  }

  get b() {
    return this.#rgba[2]
  }

  get a() {
    return this.#rgba[3]
  }

  set r(val) {
    this.#rgba[0] = val
  }

  set g(val) {
    this.#rgba[1] = val
  }

  set b(val) {
    this.#rgba[2] = val
  }

  set a(val) {
    this.#rgba[3] = val
  }

  // Named Colors
  static get Transparent() {
    return Color.fromGray(0, 0)
  }
  static get Black() {
    return Color.fromGray(0)
  }
  static get White() {
    return Color.fromGray(255)
  }
}
