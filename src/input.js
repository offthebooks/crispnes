import { DrawTools, Tools } from './consts.js'
import { Store } from './stores/store.js'
import { dateString, domQueryOne } from './utils.js'

export class Input {
  static init() {
    const { fileStore, editStore, animationStore, undoStore } = Store.context
    const editCanvas = domQueryOne('#editor canvas')
    const palette = document.getElementById('palette')
    const tools = document.getElementById('tools')
    const menu = document.getElementById('menu')

    menu.addEventListener('click', (evt) => {
      const menuItem = evt.target
        .closest('[data-menu-item]')
        ?.getAttribute('data-menu-item')

      switch (menuItem) {
        case 'save':
          fileStore.saveUpscaledCanvasImage(
            `Crispnes-${dateString()}.png`,
            editCanvas,
            20
          )
          break
        case 'clear':
          editStore.clear()
        default:
          break
      }

      if (menuItem) menu.removeAttribute('open')

      evt.stopPropagation()
    })

    tools.addEventListener('click', ({ target }) => {
      if (!tools.classList.contains('open')) {
        tools.classList.add('open')
        return
      }

      const toolEl = target.closest('[data-tool]')
      const tool = toolEl.getAttribute('data-tool')

      if (DrawTools.has(tool)) {
        editStore.tool = tool
        tools.classList.remove('open')
      } else {
        switch (tool) {
          case Tools.Animations:
            // Show Animations list modal
            break
          case Tools.Palettes:
            // Show Palettes list modal
            break
          case Tools.Redo:
            undoStore.redo()
            break
          case Tools.Undo:
            undoStore.undo()
            break
          case Tools.ZoomIn:
            editStore.zoomIn()
            break
          case Tools.ZoomOut:
            editStore.zoomOut()
            break
          case Tools.Collapse:
            tools.classList.remove('open')
            break
          default:
            break
        }
      }
    })

    palette.addEventListener('click', ({ target }) => {
      const { paletteStore } = Store.context
      const color = target.closest('#paletteColors li')
      if (color) {
        const index = Number(color.getAttribute('data-color-index'))
        paletteStore.palette.selected = index
      }
    })

    const editPosition = ({ target, offsetX, offsetY }) => {
      const { width: clientW, height: clientH } = target.getBoundingClientRect()
      const { width, height } = animationStore.frame
      const x = ~~((offsetX * width) / clientW)
      const y = ~~((offsetY * height) / clientH)
      const inbounds = x >= 0 && x < width && y >= 0 && y < height
      return inbounds ? { x, y } : null
    }

    editCanvas.addEventListener('pointerdown', (evt) => {
      if (![Tools.Draw, Tools.Fill].includes(editStore.tool)) return
      const pos = editPosition(evt)
      pos && editStore.editAt(pos)
    })

    editCanvas.addEventListener('pointermove', (evt) => {
      if (editStore.tool !== Tools.Draw) return
      const pos = editPosition(evt)
      debugger
      pos && editStore.continueEdit(pos)
    })

    const preventCallback = (e) => e.preventDefault()
    document.addEventListener('gesturestart', preventCallback)
    document.addEventListener('gesturechange', preventCallback)
    document.addEventListener('gestureend', preventCallback)
    document.addEventListener('pointerup', () => editStore.recordDraw())
    document.addEventListener('click', () => menu.removeAttribute('open'))
    document.addEventListener('keydown', (evt) => {
      const { undoStore } = Store.context
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'z') {
        evt.preventDefault()
        if (evt.shiftKey) undoStore.redo()
        else undoStore.undo()
      }
    })
  }
}
