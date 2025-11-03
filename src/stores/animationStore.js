import { Animation } from '../types/animation.js'
import { untitledNameUniqueFromStrings } from '../utils.js'
import { Store } from './store.js'

// const animationItemsEl = document.getElementById('animationItems')
// const animationAddButtonEl = document.getElementById('animationAdd')

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

    this.refreshItems()
  }

  #loadFromDataModel(dataModel) {
    const { animationState, animations } = dataModel
    const { selectedAnimation, selectedFrame } = animationState

    if (!animationState || !animations) return false

    this.#model.animationList = animations.map(({ frames, ...dataModel }) =>
      Animation.fromDataModel(dataModel, frames)
    )
    this.#animationMap = Object.fromEntries(
      this.animations.map((a) => [a.name, a])
    )

    this.#model.selectedAnimation = this.animationForName(selectedAnimation)
    this.#model.selectedFrame = selectedFrame

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
        animationList: this.animationNames
      },
      animations: this.animations.map((a) => a.dataModel),
      frames: this.animations.flatMap((a) => a.framesData)
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

  get animationListItems() {
    return this.animations.map((a) => a.item)
  }

  get animations() {
    return this.#model.animationList
  }

  set animation(name) {
    this.#model.selectedAnimation = this.animationForName(name)
    this.frame = 0
  }

  get animationNames() {
    return this.#model.animationList.map((a) => a.name)
  }

  set frame(index) {
    this.#model.selectedFrame = index
    Store.context.editStore.renderCanvas()
  }

  addAnimation(name, width, height) {
    this.animations.push(new Animation(name, width, height))
  }

  refreshItems() {
    // animationItemsEl.replaceChildren(
    //   animationAddButtonEl,
    //   ...this.animationListItems
    // )
  }

  get nextAnimationName() {
    return untitledNameUniqueFromStrings(this.animationNames)
  }

  animationForName(name) {
    return this.#animationMap[name]
  }
}
