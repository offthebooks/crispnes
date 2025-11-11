import { Sprite } from './sprite.js'
import { domQueryOne, elementFromTemplate } from '../utils.js'
import { Store } from '../stores/store.js'
import { Whoops } from '../whoops.js'

const defaultModel = Object.seal({
  name: null,
  palette: null,
  width: 16,
  height: 16
})

export class Animation {
  static itemTemplate = domQueryOne('#animationItem')
  static frameItemTemplate = domQueryOne('#frameItem')

  #model
  #frames
  #DOM

  constructor(model = {}) {
    this.#model = { ...defaultModel, ...model }
    this.#model.name ??= Store.context.animationStore.nextAnimationName
    this.#model.palette ??= Store.context.paletteStore.palette
    this.#frames = [new Sprite({ animation: this })]
    this.#DOM = { item: null }
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

  set palette(val) {
    this.#model.palette = val
    this.#render()
  }

  get framesIndices() {
    return this.#frames.map((f) => f.dataIndex)
  }

  get framesData() {
    return this.#frames.map((f) => f.dataModel)
  }

  get framesItems() {
    const { width, height } = this
    const { animationStore: selectedFrameIndex } = Store.context
    return this.#frames.map((f, idx) => {
      const li = elementFromTemplate(Animation.frameItemTemplate)
      const canvas = domQueryOne('canvas', li)

      if (idx === selectedFrameIndex) li.classList.add('selected')

      canvas.width = width
      canvas.height = height
      f.addRenderCanvas(canvas)
      return li
    })
  }

  add() {
    this.#frames.push(new Sprite({ animation: this }))
    this.#render()
  }

  remove(index) {
    if (this.length <= 1)
      throw Whoops.invalidOperation('Cannot delete last frame of an animation.')
    this.#frames.splice(index, 1)
    this.#render()
  }

  sprite(index) {
    return this.#frames[index]
  }

  indexOfFrame(frame) {
    return this.#frames?.indexOf(frame)
  }

  #render() {
    this.#DOM.item ??= elementFromTemplate(Animation.itemTemplate)
    const { item } = this.#DOM
    const { name, length, width, height } = this
    const s = length === 1 ? '' : 's'
    item.querySelector('.name').textContent = name
    item.querySelector('.frameCount').textContent = `${length} frame${s}`
    item.querySelector('.size').textContent = `${width} x ${height} pixels`
    const canvas = item.querySelector('.preview canvas')
    this.sprite(0).addRenderCanvas(canvas)
    return this.#DOM
  }
}
