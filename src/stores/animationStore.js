import { Animation } from '../types/animation.js'
import { Store } from './store.js'

const defaultModel = Object.seal({
  selectedAnimation: null,
  selectedFrame: 0,

  animations: [new Animation('Untitled', 16, 16)]
})

export class AnimationStore {
  #model

  constructor() {
    this.#model = { ...defaultData }
  }

  get animation() {
    return this.#data.animations[this.#data.selectedAnimation]
  }

  get frame() {
    return this.animation.sprite(this.#data.selectedFrame)
  }

  get animationItems() {
    return this.#data.animations.map((a) => a.item)
  }

  set animation(index) {
    this.#data.selectedAnimation = index
    this.frame = 0
  }

  set frame(index) {
    this.#data.selectedFrame = index
    Store.context.editStore.renderCanvas()
  }

  addAnimation(name, width, height) {
    this.#data.animations.push(new Animation(name, width, height))
  }

  // State persistence
  serialize(object = this.#data) {
    // dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    // const data = dataFromStorageWithKeys(Object.keys(defaultData))
    return {}
  }
}
