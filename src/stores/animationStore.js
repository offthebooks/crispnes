import { ButtonStyle } from '../consts.js'
import { Animation } from '../types/animation.js'
import {
  clamp,
  describeType,
  domCreate,
  domQueryList,
  domQueryOne,
  elementFromTemplate,
  focusElement,
  untitledNameUniqueFromStrings
} from '../utils.js'
import { Whoops } from '../whoops.js'
import { Store } from './store.js'

const editTemplate = domQueryOne('#animationEdit')
const frameTemplate = domQueryOne('#frameEdit')
const previewTemplate = domQueryOne('#animationView')

const defaultModel = Object.seal({
  selectedAnimation: null,
  selectedFrame: 0,

  animationList: [] // [new Animation('Untitled', 16, 16)]
})

export class AnimationStore {
  #model
  #animationMap
  #DOM

  constructor() {
    this.#model = { ...defaultModel }
    this.#animationMap = {}
    this.#DOM = {
      animationItems: domCreate({ tag: 'ol', cls: 'animationItems' }),
      frameItems: domQueryOne('#frameItems')
    }
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
    this.refreshAnimationsMap()

    this.#model.selectedAnimation = this.animationForName(selectedAnimation)
    this.#model.selectedFrame = selectedFrame ?? 0
    this.#refreshFrameItems()

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

  get selectedFrameIndex() {
    return this.#model.selectedFrame
  }

  set selectedFrameIndex(idx) {
    if (typeof idx === 'number' && idx >= 0 && idx < this.animation.length) {
      this.#model.selectedFrame = idx
      this.#refreshFrameItems()
      this.#persist()

      Store.context.editStore.renderCanvas()
    }
  }

  get animationItemsList() {
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
    this.selectedFrameIndex = 0
    this.#refreshFrameItems()

    editStore.renderCanvas()
    editStore.positionContainer()
  }

  get animationNames() {
    return this.#model.animationList.map((a) => a.name)
  }

  addAnimation(name, width, height, palette) {
    const {
      undoStore,
      animationStore: { animation: previous }
    } = Store.context
    const frameIndex = this.selectedFrameIndex
    const animation = new Animation({ name, width, height, palette })

    const redo = () => {
      this.animations.push(animation)
      this.#animationMap[name] = animation
      this.animation = animation
      this.#persist()
    }

    const undo = () => {
      this.animation = previous
      this.selectedFrameIndex = frameIndex
      this.cleanupAnimation(animation)
    }

    undoStore.record({ name: 'create animation', undo, redo })
    redo()
  }

  removeAnimation(animation) {
    if (this.animations.length <= 1) return

    const { dataStore, undoStore } = Store.context
    const frameIndex = this.selectedFrameIndex
    const index = this.animations.indexOf(animation)

    const redo = () => {
      this.animation = index ? index - 1 : 1
      this.cleanupAnimation(animation)
      this.animationItemsList // refresh items in the list
    }

    const undo = () => {
      this.animations.splice(index, 0, animation)
      this.#animationMap[animation.name] = animation
      this.animation = animation
      this.selectedFrameIndex = frameIndex
      dataStore.save({
        animationState: this.animationState,
        animations: [animation.dataModel],
        frames: animation.framesData
      })
    }

    undoStore.record({ name: 'delete animation', undo, redo })
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
    const { dataStore, undoStore, animationStore } = Store.context
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
      animationStore.refreshAnimationsMap()
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

    undoStore.record({ name: 'edit animation', undo, redo })
    redo()
  }

  presentAnimationList() {
    const { viewStore } = Store.context
    const content = this.animationItemsList

    viewStore.pushView({
      title: 'Animations',
      content,
      buttons: [
        {
          label: '<i class="add icon"></i> Add Animation',
          handler: () => this.presentAnimationEdit(),
          style: ButtonStyle.Primary
        }
      ],
      closeLabel: 'Close'
    })

    focusElement(this.animation.item)
  }

  presentAnimationEdit(animation) {
    const { viewStore, paletteStore } = Store.context
    const editForm = elementFromTemplate(editTemplate)
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
            message: `Are you sure you want to delete ${animation.name}?`,
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
      } else if (/['"/\\]/.test(nameValue)) {
        nameInput.setCustomValidity('Quotes and slashes not allowed')
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
              Number(widthInput.value),
              Number(heightInput.value),
              paletteStore.paletteForName(paletteInput.value)
            )
            viewStore.dismiss()
          }
        }

    viewStore.pushView({
      title: animation ? 'Edit Animation' : 'Create Animation',
      content: editForm,
      buttons: [{ ...button, style: ButtonStyle.Primary }],
      afterPresent: () => nameInput.select()
    })
  }

  presentAnimationView() {
    const { viewStore } = Store.context
    const { animation } = this
    const content = elementFromTemplate(previewTemplate)
    const canvas = domQueryOne('canvas', content)

    const state = {
      nextFrame: Date.now() + (animation.sprite(0).duration * 1000) / 60,
      index: 0
    }

    animation.sprite(0).addRenderCanvas(canvas)

    const animationLoop = () => {
      if (!content.isConnected) return
      const now = Date.now()
      if (now >= state.nextFrame) {
        const index = (state.index + 1) % animation.length
        const frame = animation.sprite(index)
        frame.addRenderCanvas(canvas)
        state.index = index
        state.nextFrame = now + Math.floor((frame.duration * 1000) / 60) - 1
      }
      requestAnimationFrame(animationLoop)
    }

    viewStore.pushView({
      title: animation.name,
      content,
      buttons: [],
      closeLabel: 'Done'
    })

    animationLoop()
  }

  presentFrameEdit() {
    const { dataStore, undoStore, viewStore } = Store.context
    const frameForm = elementFromTemplate(frameTemplate)
    const form = domQueryOne('form', frameForm)
    const { animation, frame } = this
    const { duration, frameIndex } = frame

    const durationInput = domQueryOne('[name="duration"]', form)
    durationInput.value = duration

    if (animation.length > 1) {
      const deleteBtn = domCreate({
        tag: 'button',
        cls: 'deleteFrame',
        children: 'Delete'
      })
      form.after(deleteBtn)
      deleteBtn.addEventListener('click', () => {
        viewStore.confirm({
          action: 'Delete',
          message: `Are you sure you want to delete frame ${frameIndex + 1} of ${animation.name}?`,
          confirmed: () => {
            animation.remove(frame)
            viewStore.dismiss()
          }
        })
      })
    }

    form.addEventListener('input', () => {
      const duration = durationInput.value !== '' && Number(durationInput.value)
      if (!Number.isFinite(duration)) {
        durationInput.setCustomValidity('Valid number required')
      } else {
        durationInput.value = clamp(duration, 18000, 1)
        durationInput.setCustomValidity('')
      }
    })

    viewStore.pushView({
      title: `${animation.name} - Frame ${frameIndex + 1}`,
      content: frameForm,
      buttons: [
        {
          label: 'Apply to All',
          handler: () => {
            if (!form.checkValidity()) {
              form.reportValidity()
              return
            }

            const duration = Number(durationInput.value)
            const oldDurations = animation.framesDurations
            const redo = () => {
              for (let i = 0; i < animation.length; ++i) {
                animation.sprite(i).duration = duration
              }
              dataStore.save({ frames: animation.framesData })
            }
            const undo = () => {
              oldDurations.forEach((d, i) => (animation.sprite(i).duration = d))
              dataStore.save({ frames: animation.framesData })
            }

            undoStore.record({ name: 'set durations', undo, redo })
            redo()
            viewStore.dismiss()
          }
        },
        {
          label: 'Apply',
          handler: () => {
            if (!form.checkValidity()) {
              form.reportValidity()
              return
            }

            const duration = Number(durationInput.value)
            const oldDuration = frame.duration
            const redo = () => {
              frame.duration = duration
              dataStore.save({ frames: [frame.dataModel] })
            }
            const undo = () => {
              frame.duration = oldDuration
              dataStore.save({ frames: [frame.dataModel] })
            }

            undoStore.record({ name: 'set duration', undo, redo })
            redo()
            viewStore.dismiss()
          },
          style: ButtonStyle.Primary
        }
      ],
      afterPresent: () => durationInput.select()
    })
  }

  get nextAnimationName() {
    return untitledNameUniqueFromStrings(this.animationNames)
  }

  animationForName(name) {
    return this.#animationMap[name]
  }

  get frameItems() {
    return this.#DOM.frameItems
  }

  #refreshFrameItems() {
    this.frameItems.replaceChildren(...this.animation.framesItems)
    focusElement(domQueryOne('.selected', this.frameItems))
  }

  refreshAnimationsMap() {
    this.#animationMap = Object.fromEntries(
      this.animations.map((a) => [a.name, a])
    )
  }
}
