import { Sprite, maxSideLength, minSideLength } from './sprite.js'
import {
  clamp,
  elementFromTemplate,
  untitledNameUniqueFromStrings
} from '../utils.js'
import { Store } from '../stores/store.js'

const defaultModel = Object.seal({
  name: null,
  palette: null,
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
    this.#model.name ??= Store.context.animationStore.nextAnimationName
    this.#model.palette ??= Store.context.paletteStore.palette
    this.#frames = []
    this.#DOM = { item: null }
    this.add()
  }

  static fromDataModel = (model, framesData) => {
    const { paletteStore } = Store.context
    const palette = paletteStore.paletteForName(model.palette)
    const animation = new Animation({ ...model, palette })
    animation.#frames = framesData.map((f) =>
      Sprite.fromDataModel({ ...f, animation })
    )
    return animation
  }

  get dataModel() {
    const palette = this.palette.name
    return { ...this.#model, palette }
  }

  get name() {
    return this.#model.name
  }

  set name(val) {
    this.#model.name = val
    this.#render()
  }

  get item() {
    return this.#DOM?.item ?? this.#render().item
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

  get framesData() {
    return this.#frames.map((f) => f.dataModel)
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
