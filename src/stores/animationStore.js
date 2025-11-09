import { ButtonStyle } from '../consts.js'
import { Animation } from '../types/animation.js'
import {
  clamp,
  describeType,
  domCreate,
  domQueryList,
  domQueryOne,
  elementFromTemplate,
  elementIndex,
  forElements,
  removeClass,
  untitledNameUniqueFromStrings
} from '../utils.js'
import { Whoops } from '../whoops.js'
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
  #DOM

  constructor() {
    this.#model = { ...defaultModel }
    this.#animationMap = {}
    this.#DOM = {
      animationItems: domCreate({ tag: 'ol', cls: 'animationItems' })
    }

    this.#DOM.animationItems.addEventListener('click', ({ target: el }) => {
      const { viewStore } = Store.context
      const editBtn = el.closest('button.edit')
      const itemEl = el.closest('.itemCard')
      if (!itemEl) return

      const animation = this.animations[elementIndex(itemEl)]

      if (editBtn) {
        this.presentAnimationEdit(animation)
        return
      }

      this.animation = animation
      viewStore.dismiss()
    })
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
    this.animation.item.classList.add('selected')
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
    const { animationState } = this
    return {
      animationState,
      animations: this.animations.map((a) => a.dataModel),
      frames: this.animations.flatMap((a) => a.framesData)
    }
  }

  get animationState() {
    return {
      selectedAnimation: this.animation.name,
      selectedFrame: this.#model.selectedFrame,
      animationList: this.animationNames
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
    this.#DOM.animationItems.replaceChildren(
      ...this.animations.map((a) => a.item)
    )
    return this.#DOM.animationItems
  }

  set animation(a) {
    const { editStore } = Store.context
    let animation = null

    this.animation.item.classList.remove('selected')

    if (a instanceof Animation) animation = a
    else if (typeof a === 'number' && a < this.animations.length)
      animation = this.animations[a]
    else if (typeof a === 'string') animation = this.animationForName(a)

    if (animation == null)
      throw Whoops.invalidOperation(
        `Could not find animation for ${describeType(a)}: ${a}`
      )

    animation.item.classList.add('selected')
    this.#model.selectedAnimation = animation
    this.frame = 0
    editStore.renderCanvas()
    editStore.positionContainer()
  }

  get animationNames() {
    return this.#model.animationList.map((a) => a.name)
  }

  set frame(index) {
    this.#model.selectedFrame = index
    Store.context.editStore.renderCanvas()
  }

  addAnimation(name, width, height, palette) {
    const {
      undoStore,
      animationStore: { animation: previous }
    } = Store.context
    const frame = this.#model.selectedFrame
    const animation = new Animation({ name, width, height, palette })

    const redo = () => {
      this.animations.push(animation)
      this.#animationMap[name] = animation
      this.animation = animation
      this.#persist()
    }

    const undo = () => {
      this.animation = previous
      this.frame = frame
      this.cleanupAnimation(animation)
    }

    undoStore.record({ name: 'Create Animation', undo, redo })
    redo()
  }

  removeAnimation(animation) {
    if (this.animations.length <= 1) return

    const { dataStore, undoStore } = Store.context
    const frame = this.frame
    const index = this.animations.indexOf(animation)

    const redo = () => {
      this.animation = index ? index - 1 : 1
      this.cleanupAnimation(animation)
      this.animationListItems // refresh items in the list
    }

    const undo = () => {
      this.animations.splice(index, 0, animation)
      this.#animationMap[animation.name] = animation
      this.animation = animation
      this.frame = frame
      dataStore.save({
        animationState: this.animationState,
        animations: [animation.dataModel],
        frames: animation.framesData
      })
    }

    undoStore.record({ name: 'Delete animation', undo, redo })
    redo()
  }

  cleanupAnimation(animation) {
    const { dataStore } = Store.context
    const { name, framesIndices } = animation
    const removeIndex = this.animations.indexOf(animation)

    if (removeIndex === -1)
      throw Whoops.invalidOperation(
        `Tried deleting animation "${animation?.name}", but it wasn't found`
      )

    delete this.#animationMap[animation.name]
    this.#model.animationList.splice(removeIndex, 1)
    const { animationState } = this

    dataStore.save({
      animationState,
      remove: {
        animations: [name],
        frames: framesIndices
      }
    })
  }

  updateAnimationInfo(animation, info) {
    const { dataStore, undoStore } = Store.context
    const {
      name: oldName,
      palette: oldPalette,
      framesIndices: oldFramesIndices
    } = animation
    const name = info.name || oldName
    const palette = info.palette || oldPalette

    if (name === oldName && palette === oldPalette) return

    const framesIndices = oldFramesIndices.map(([_, index]) => [name, index])

    const applyInfo = (name, palette, remove) => {
      animation.name = name
      animation.palette = palette
      dataStore.save({
        animationState: this.animationState,
        animations: [animation.dataModel],
        frames: animation.framesData,
        remove
      })
    }

    const redo = () =>
      applyInfo(name, palette, {
        animations: [oldName],
        frames: oldFramesIndices
      })
    const undo = () =>
      applyInfo(oldName, oldPalette, {
        animations: [name],
        frames: framesIndices
      })

    undoStore.record({ name: 'Edit Animation', undo, redo })
    redo()
  }

  presentAnimationList() {
    const { viewStore } = Store.context
    const content = this.animationListItems

    viewStore.pushView({
      title: 'Animations',
      content,
      buttons: [
        {
          label: 'Add Animation <i class="add icon"</i>',
          handler: () => this.presentAnimationEdit(),
          style: ButtonStyle.Primary
        }
      ],
      closeLabel: 'Close'
    })
  }

  presentAnimationEdit(animation) {
    const { viewStore, paletteStore } = Store.context
    const editForm = elementFromTemplate(AnimationStore.editTemplate)
    const form = domQueryOne('form', editForm)
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
    paletteInput.replaceChildren(...paletteStore.paletteSelectOptions)

    if (animation) {
      widthInput.disabled = true
      heightInput.disabled = true
      if (this.animations.length > 1) {
        const deleteBtn = domCreate({
          tag: 'button',
          cls: 'deleteAnimation',
          children: 'Delete'
        })
        form.after(deleteBtn)
        deleteBtn.addEventListener('click', () => {
          viewStore.confirm({
            action: 'Delete',
            message: `Are you sure you want to delete animation: ${animation.name}`,
            confirmed: () => {
              this.removeAnimation(animation)
              viewStore.popView()
            }
          })
        })
      }
    }

    form.addEventListener('input', () => {
      const nameValue = nameInput.value.trim()
      if (widthInput.value !== '')
        widthInput.value = clamp(widthInput.value, 256, 1)
      if (heightInput.value !== '')
        heightInput.value = clamp(heightInput.value, 256, 1)

      if (nameValue === '') {
        nameInput.setCustomValidity('Name required')
      } else if (
        nameInput.value !== name &&
        this.animationForName(nameInput.value)
      ) {
        nameInput.setCustomValidity('Animation name already exists')
      } else {
        nameInput.setCustomValidity('')
      }
    })

    const button = animation
      ? {
          label: 'Update',
          handler: () => {
            if (!form.checkValidity()) {
              form.reportValidity()
              return
            }

            this.updateAnimationInfo(animation, {
              name: nameInput.value,
              palette: paletteStore.paletteForName(paletteInput.value)
            })
            viewStore.popView()
          }
        }
      : {
          label: 'Create',
          handler: () => {
            if (!form.checkValidity()) {
              form.reportValidity()
              return
            }

            this.addAnimation(
              nameInput.value.trim(),
              widthInput.value,
              heightInput.value,
              paletteStore.paletteForName(paletteInput.value)
            )
            viewStore.dismiss()
          }
        }

    viewStore.pushView({
      title: animation ? 'Edit Animation' : 'Create Animation',
      content: editForm,
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
