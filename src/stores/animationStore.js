import { Animation } from '../types/animation.js'
import { Store } from './store.js'

const defaultModel = Object.seal({
  selectedAnimation: null,
  selectedFrame: 0,

  animationList: [] // [new Animation('Untitled', 16, 16)]
})

export class AnimationStore {
  #model
  #animationMap

  constructor() {
    this.#model = { ...defaultModel }
    this.#animationMap = {}
  }

  async init() {
    const { dataStore } = Store.context
    const dataModel = await dataStore.loadAnimationData()

    if (!dataModel || !this.#loadFromDataModel(dataModel)) {
      // Populate default animation entry
      const animation = new Animation({ width: 16, height: 16 })
      this.#model.animationList = [animation]
      this.#animationMap = { [animation.name]: animation }
      this.#model.selectedAnimation = animation
      this.#persist()
    }
  }

  #loadFromDataModel(dataModel) {
    const { animationState, animations, frames } = dataModel

    if (!animationState || !animations || !frames) return false

    return true
  }

  #persist() {
    const { dataStore } = Store.context
    dataStore.save(this.dataModel)
  }

  // Accessors
  get dataModel() {
    return {
      animationState: {
        selectedAnimation: this.animation.name,
        selectedFrame: this.#model.selectedFrame,
        animationList: this.animations.map((a) => a.name)
      },
      animations: this.animations.map((a) => a.dataModel),
      frames: this.animations.flatMap((a) =>
        a.frames.map((f) => {
          f.dataModel
        })
      )
    }
  }

  get animations() {
    return this.#model.animationList
  }

  get animation() {
    return this.#model.selectedAnimation
  }

  get frame() {
    return this.animation.sprite(this.#model.selectedFrame)
  }

  get animationItems() {
    return this.#model.animationList.map((a) => a.item)
  }

  get animations() {
    return this.#model.animationList
  }

  set animation(name) {
    this.#model.selectedAnimation = this.animationForName(name)
    this.frame = 0
  }

  set frame(index) {
    this.#model.selectedFrame = index
    Store.context.editStore.renderCanvas()
  }

  addAnimation(name, width, height) {
    this.animations.push(new Animation(name, width, height))
  }

  get nextAnimationName() {
    let num = this.animations.length
    let name
    do {
      name = `Untitled ${++num}`
    } while (this.animationForName(name))
    return name
  }

  animationForName(name) {
    return this.#animationMap[name]
  }
}
