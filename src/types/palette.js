export class Palette {
  #name
  #colors

  constructor(name) {
    this.#name = name || 'Untitled'
    this.#colors = new Uint32Array[3]()
  }

  get name() {
    return this.#name
  }

  set name(val) {
    this.#name = val
  }

  add() {
    this.#colors = new Uint32Array()
  }

  remove(index) {
    this.#frames.splice(index, 1)
  }

  sprite(index) {
    return this.#frames[index]
  }
}
