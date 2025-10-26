import { Sprite, maxSideLength, minSideLength } from './sprite.js'
import {
  clamp,
  elementFromTemplate,
  untitledNameUniqueFromStrings
} from '../utils.js'
import { Store } from '../stores/store.js'

const defaultModel = Object.seal({
  name: Store.context.animationStore.nextAnimationName,
  palette: Store.context.paletteStore.palette,
  width: 16,
  height: 16
})

export class Animation {
  static itemTemplate = document.querySelector('#animationItems template')

  #model
  #frames
  #DOM

  constructor(model = {}) {
    this.#model = { ...defaultModel, ...model }
    this.#frames = model.frames ?? []
    this.#DOM = null
    this.#frames.length || this.add()
  }

  static fromDataModel = ({ name, width, height }) => {
    return new Animation(name, width, height)
  }

  get dataModel() {
    return {}
  }

  get name() {
    return this.#model.name
  }

  set name(val) {
    this.#model.name = val
    this.#render()
  }

  get item() {
    return this.#DOM.item ?? this.#render().item
  }

  get width() {
    return this.#model.width
  }

  get height() {
    return this.#model.height
  }

  get length() {
    return this.#frames.length
  }

  get palette() {
    return this.#model.palette
  }

  add() {
    this.#frames.push(new Sprite({ animation: this }))
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
