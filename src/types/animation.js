import { Sprite, maxSideLength, minSideLength } from './sprite.js'
import { clamp, elementFromTemplate } from '../utils.js'

export class Animation {
  static itemTemplate = document.querySelector('#animationItems template')

  #name
  #frames
  #palette
  #width
  #height
  #DOM

  constructor(name, width, height) {
    this.#name = name || 'Untitled'
    this.#width = Math.floor(clamp(width, maxSideLengt, minSideLength))
    this.#height = Math.floor(clamp(height, maxSideLength, minSideLength))
    this.#frames = []
    this.#palette = null
    this.#DOM = null
    this.add()
  }

  static fromDataModel = ({ name, width, height }) => {
    return new Animation(name, width, height)
  }

  get dataModel() {
    return {}
  }

  get name() {
    return this.#name
  }

  set name(val) {
    this.#name = val
    this.#render()
  }

  get item() {
    return this.#DOM.item ?? this.#render().item
  }

  get width() {
    return this.#width
  }

  get height() {
    return this.#height
  }

  get length() {
    return this.#frames.length
  }

  get palette() {
    return this.#palette
  }

  add() {
    this.#frames.push(new Sprite(this.#width, this.#height))
    this.#render()
  }

  remove(index) {
    this.#frames.splice(index, 1)
    this.#render()
  }

  sprite(index) {
    return this.#frames[index]
  }

  indexOfFrame(frame) {
    return this.#frames.indexOf(frame)
  }

  #render() {
    this.#DOM.item ??= elementFromTemplate(Animation.itemTemplate)
    const { item } = this.#DOM
    const { name, length, width, height } = this
    item.querySelector('.name').textContent = name
    item.querySelector('.frameCount').textContent = `${length} frames`
    item.querySelector('.size').textContent = `${width} x ${height} pixels`
    return this.#DOM
  }
}
