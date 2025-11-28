import { DrawTools, Tool } from './consts.js'
import { GestureInput } from './gestureInput.js'
import { Store } from './stores/store.js'
import { domQueryOne, elementIndex, forElements, removeClass } from './utils.js'

export class Input {
  static init() {
    const { animationStore, editStore, fileStore, undoStore, viewStore } =
      Store.context
    const editCanvas = domQueryOne('#editor canvas')
    const editor = domQueryOne('#editor')
    const palette = domQueryOne('#palette')
    const tools = domQueryOne('#tools')
    const menu = domQueryOne('#menu')
    const framePicker = domQueryOne('#framePicker')
    const preventCallback = (e) => e.preventDefault()

    // Menu
    menu.addEventListener('click', (evt) => {
      const menuItem = evt.target
        .closest('[data-menu-item]')
        ?.getAttribute('data-menu-item')

      switch (menuItem) {
        case 'animations':
          animationStore.presentAnimationList()
          break
        case 'exportSheet':
          fileStore.exportSpriteSheetDialog()
          break
        case 'save':
          fileStore.saveFrameDialog(editCanvas)
          break
        default:
          break
      }

      if (menuItem) menu.removeAttribute('open')

      evt.stopPropagation()
    })

    // Tools
    tools.addEventListener('click', ({ target }) => {
      const toolEl = target.closest('[data-tool]')
      const tool = toolEl?.getAttribute('data-tool')

      if (DrawTools.has(tool)) {
        editStore.tool = tool
      } else {
        switch (tool) {
          case Tool.Clear:
            editStore.clear()
            break
          case Tool.Redo:
            undoStore.redo()
            break
          case Tool.Undo:
            undoStore.undo()
            break
          case Tool.ZoomIn:
            editStore.zoomIn()
            break
          case Tool.ZoomOut:
            editStore.zoomOut()
            break
          default:
            break
        }
      }
    })

    // Palettes
    palette.addEventListener('click', ({ target }) => {
      const { paletteStore } = Store.context
      const color = target.closest('#paletteColors li')
      if (color) {
        const index = Number(color.getAttribute('data-color-index'))
        paletteStore.palette.selected = index
      }
    })

    // Animations
    animationStore.animationItemsList.addEventListener(
      'click',
      ({ target: el }) => {
        const editBtn = el.closest('button.edit')
        const itemEl = el.closest('.itemCard')
        if (!itemEl) return

        const animation = animationStore.animations[elementIndex(itemEl)]

        if (editBtn) {
          animationStore.presentAnimationEdit(animation)
          return
        }

        animationStore.animation = animation
        viewStore.dismiss()
      }
    )

    framePicker.addEventListener('click', ({ target }) => {
      if (target.closest('button.add')) {
        const { animation } = animationStore
        animation.add()
        return
      }

      if (target.closest('button.clone')) {
        const { animation, frame } = animationStore
        animation.add(frame)
        return
      }
      if (target.closest('button.edit')) {
        animationStore.presentFrameEdit()
        return
      }

      if (target.closest('button.moveLeft')) {
        const {
          animation,
          frame: { frameIndex }
        } = animationStore
        animation.moveLeft(frameIndex)
        return
      }

      if (target.closest('button.moveRight')) {
        const {
          animation,
          frame: { frameIndex }
        } = animationStore
        animation.moveRight(frameIndex)
        return
      }

      if (target.closest('button.play')) {
        animationStore.presentAnimationView()
        return
      }

      const item = target.closest('.frameItem')
      if (item) animationStore.selectedFrameIndex = elementIndex(item)
    })

    // Editor
    const editPosition = ({ target, offsetX, offsetY }) => {
      const { width: clientW, height: clientH } = target.getBoundingClientRect()
      const { width, height } = animationStore.frame
      const x = ~~((offsetX * width) / clientW)
      const y = ~~((offsetY * height) / clientH)
      const inbounds = x >= 0 && x < width && y >= 0 && y < height
      return inbounds ? { x, y } : null
    }

    editCanvas.addEventListener('pointerdown', (evt) => {
      if (!DrawTools.has(editStore.tool)) return
      const pos = editPosition(evt)
      pos && editStore.editAt(pos)
    })

    editCanvas.addEventListener('pointermove', (evt) => {
      if (![Tool.Draw, Tool.Erase].includes(editStore.tool)) return
      const pos = editPosition(evt)
      pos && editStore.continueEdit(pos)
    })

    editor.addEventListener('contextmenu', preventCallback)
    GestureInput.captureGestures({
      element: editor,
      onZoom: (factor) => {
        editStore.cancelEdit()
        editStore.zoom = factor
      },
      onPan: (delta) => {
        editStore.cancelEdit()
        editStore.pan = delta
      }
    })

    // Keypresses (undo shortcuts)
    document.addEventListener('keydown', (evt) => {
      const { undoStore } = Store.context
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'z') {
        evt.preventDefault()
        if (evt.shiftKey) undoStore.redo()
        else undoStore.undo()
      }
    })

    document.addEventListener('gesturestart', preventCallback)
    document.addEventListener('gesturechange', preventCallback)
    document.addEventListener('gestureend', preventCallback)
    document.addEventListener('pointercancel', editStore.cancelEdit())
    document.addEventListener('touchcancel', editStore.cancelEdit())
    document.addEventListener('pointerup', () => editStore.recordEdit())
    document.addEventListener('click', () => menu.removeAttribute('open'))
  }
}
