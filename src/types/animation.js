import { Sprite, maxSideLength } from './sprite.js'
import { clamp, elementFromTemplate } from '../utils.js'

export class Animation {
  static itemTemplate = document.querySelector('#animationItems template')

  #name
  #frames
  #width
  #height
  #item

  constructor(name, width, height) {
    this.#name = name || 'Untitled'
    this.#width = Math.floor(clamp(width, maxSideLength))
    this.#height = Math.floor(clamp(height, maxSideLength))
    this.#frames = []
    this.add()
  }

  get name() {
    return this.#name
  }

  set name(val) {
    this.#name = val
    this.#render()
  }

  get item() {
    return this.#item ?? this.#render()
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

  #render() {
    this.#item ??= elementFromTemplate(Animation.itemTemplate)
    this.#item.querySelector('.name').textContent = this.#name
    this.#item.querySelector('.frameCount').textContent =
      `${this.#frames.length} frames`
    this.#item.querySelector('.size').textContent =
      `${this.#width} x ${this.#height} pixels`
    return this.#item
  }
}
