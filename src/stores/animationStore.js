import { ButtonStyle } from '../consts.js'
import { Animation } from '../types/animation.js'
import {
  domCreate,
  domQueryList,
  domQueryOne,
  elementFromTemplate,
  untitledNameUniqueFromStrings
} from '../utils.js'
import { Store } from './store.js'

// const animationItemsEl = document.getElementById('animationItems')
// const animationAddButtonEl = document.getElementById('animationAdd')

const defaultModel = Object.seal({
  selectedAnimation: null,
  selectedFrame: 0,

  animationList: [] // [new Animation('Untitled', 16, 16)]
})

export class AnimationStore {
  static editTemplate = document.querySelector('#animationEdit')

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
    const ol = domCreate({ tag: 'ol', cls: 'animationItems' })
    ol.replaceChildren(...this.animations.map((a) => a.item))
    return ol
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

  presentAnimationList() {
    const { viewStore } = Store.context
    viewStore.pushView({
      title: 'Animations',
      content: this.animationListItems,
      buttons: [
        {
          label: `Add Animation <i class="add icon"</i>`,
          handler: () => this.presentAnimationEdit(),
          style: ButtonStyle.Primary
        }
      ]
    })
  }

  presentAnimationEdit(animation) {
    const { viewStore } = Store.context
    const form = elementFromTemplate(AnimationStore.editTemplate)
    const { width, height, palette } = animation ?? this.animation
    const name = animation?.name ?? this.nextAnimationName

    const [nameInput, widthInput, heightInput, paletteInput] = domQueryList(
      [
        '[name="name"]',
        '[name="width"]',
        '[name="height"]',
        '[name="palette"]'
      ],
      form
    )

    nameInput.value = name
    widthInput.value = width
    heightInput.value = height
    paletteInput.value = palette.name

    const button = animation
      ? { label: 'Update', handler: () => {} }
      : {
          label: 'Create',
          handler: () => {
            this.addAnimation(
              nameInput.value,
              widthInput.value,
              heightInput.value
            )
            viewStore.popView()
          }
        }

    viewStore.pushView({
      title: 'Edit Animation',
      content: form,
      buttons: [{ ...button, style: ButtonStyle.Primary }]
    })
  }

  get nextAnimationName() {
    return untitledNameUniqueFromStrings(this.animationNames)
  }

  animationForName(name) {
    return this.#animationMap[name]
  }
}
