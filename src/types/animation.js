import { Sprite } from './sprite.js'
import { domQueryOne, elementFromTemplate, inBounds } from '../utils.js'
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

  get framesDurations() {
    return this.#frames.map((f) => f.duration)
  }

  get framesItems() {
    const { width, height } = this
    const { selectedFrameIndex } = Store.context.animationStore
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

  add(clone) {
    const { animationStore, dataStore, undoStore } = Store.context

    if (clone?.animation !== this)
      Whoops.invalidOperation(
        'Attempting to clone a frame from a different parent animation.'
      )

    const frame = clone
      ? new Sprite({
          animation: this,
          bytes: clone.bytes,
          duration: clone.duration
        })
      : new Sprite({ animation: this })
    const oldIndex = animationStore.selectedFrameIndex
    const index = clone ? clone.frameIndex + 1 : this.length

    const redo = () => {
      this.#frames.splice(index, 0, frame)
      animationStore.selectedFrameIndex = index
      this.#render()
    }
    const undo = () => {
      const { framesIndices } = this
      this.#frames.splice(index, 1)
      dataStore.save({ remove: { frames: framesIndices } })
      animationStore.selectedFrameIndex = oldIndex
      this.#render()
    }

    undoStore.record({ name: clone ? 'Clone Frame' : 'Add Frame', undo, redo })
    redo()
  }

  remove(frame) {
    const index = this.indexOfFrame(frame)

    if (this.length <= 1)
      throw Whoops.invalidOperation('Cannot delete last frame of an animation.')

    if (index === -1)
      throw Whoops.invalidOperation(
        'Frame to delete was not found in animation.'
      )

    const { dataStore, undoStore, animationStore } = Store.context
    const oldFramesIndices = this.framesIndices
    const oldFrames = [...this.#frames]
    const redo = () => {
      this.#frames.splice(index, 1)
      dataStore.save({ remove: { frames: oldFramesIndices } })
      animationStore.selectedFrameIndex = Math.max(index - 1, 0)
      this.#render()
    }
    const undo = () => {
      this.#frames = [...oldFrames]
      animationStore.selectedFrameIndex = index
      this.#render()
    }

    undoStore.record({ name: 'Delete Frame', undo, redo })
    redo()
  }

  moveLeft(idx) {
    const { undoStore } = Store.context
    if (idx === 0) return
    undoStore.record({ name: 'Shift Frame Left', ...this.#swap(idx, idx - 1) })
  }

  moveRight(idx) {
    const { undoStore } = Store.context
    if (idx === this.length - 1) return
    undoStore.record({ name: 'Shift Frame Right', ...this.#swap(idx, idx + 1) })
  }

  #swap(oldIdx, newIdx) {
    if (oldIdx === newIdx) return
    if (!inBounds(0, this.length, oldIdx, newIdx))
      throw Whoops.invalidOperation(
        'Trying to swap with an out of bounds animation frame.'
      )

    const frames = this.#frames
    const action = (setIndex) => {
      const { animationStore } = Store.context
      const old = frames[oldIdx]
      frames[oldIdx] = frames[newIdx]
      frames[newIdx] = old
      animationStore.selectedFrameIndex = setIndex
    }

    action(newIdx)

    return {
      undo: () => action(oldIdx),
      redo: () => action(newIdx)
    }
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
