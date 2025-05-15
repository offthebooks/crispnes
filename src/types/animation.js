import { Sprite, maxSideLength } from './sprite.js'
import { clamp } from '../utils.js'

export class Animation {
  #name
  #frames
  #width
  #height

  constructor(name, width, height) {
    this.#name = name || 'Untitled'
    this.#width = Math.floor(clamp(width, maxSideLength))
    this.#height = Math.floor(clamp(height, maxSideLength))
    this.#frames = []
  }

  get name() {
    return this.#name
  }

  set name(val) {
    this.#name = val
  }

  add() {
    this.#frames.push(new Sprite(this.#width, this.#height))
  }

  remove(index) {
    this.#frames.splice(index, 1)
  }

  sprite(index) {
    return this.#frames[index]
  }
}
