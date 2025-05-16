export class Color {
  #components
  #rgba

  constructor(red = 0, green, blue, alpha) {
    this.#components = new Uint8Array(4)
    this.#rgba = new Uint32Array(this.#components.buffer)
    this.r = red
    this.g = green ?? red
    this.b = blue ?? red
    this.a = alpha ?? 255
  }

  get rgba() {
    return this.#rgba[0]
  }

  set rgba(value) {
    this.#rgba = value
  }

  get r() {
    return this.#components[0]
  }

  get g() {
    return this.#components[1]
  }

  get b() {
    return this.#components[2]
  }

  get a() {
    return this.#components[3]
  }

  set r(val) {
    this.#components[0] = val
  }

  set g(val) {
    this.#components[1] = val
  }

  set b(val) {
    this.#components[2] = val
  }

  set a(val) {
    this.#components[3] = val
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
