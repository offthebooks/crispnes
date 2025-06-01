import { hexStringForByte } from '../utils.js'

export class Color {
  #rgba

  constructor(red = 0, green, blue, alpha) {
    this.#rgba = new Uint8Array(4)
    this.r = red
    this.g = green ?? red
    this.b = blue ?? red
    this.a = alpha ?? 255
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
    return new Color(0, 0, 0, 0)
  }
  static get Black() {
    return new Color()
  }
  static get White() {
    return new Color(255)
  }
  static get Gray() {
    return new Color(128)
  }
  static get Red() {
    return new Color(255, 0, 0)
  }
  static get Orange() {
    return new Color(255, 128, 0)
  }
  static get Yellow() {
    return new Color(255, 255, 0)
  }
  static get Green() {
    return new Color(0, 255, 0)
  }
  static get Cyan() {
    return new Color(0, 255, 255)
  }
  static get Blue() {
    return new Color(0, 0, 255)
  }
  static get Purple() {
    return new Color(128, 0, 255)
  }
  static get Magenta() {
    return new Color(255, 0, 255)
  }
}
