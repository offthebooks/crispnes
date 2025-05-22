import { Animation } from '../types/animation.js'

const defaultData = Object.seal({
  selectedAnimation: 0,
  selectedFrame: 0,

  animations: [new Animation('Untitled', 16, 16)]
})

export class AnimationStore {
  #data

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
  }

  get animations() {
    return Object.freeze([...this.#data.animations])
  }

  get animationItems() {
    return this.animations.map((a) => a.item)
  }

  // Mutations
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
