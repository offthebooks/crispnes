import { DrawTools, Tools } from './consts.js'
import { Store } from './stores/store.js'
import { domQueryOne, elementIndex } from './utils.js'

export class Input {
  static init() {
    const { fileStore, tileStore, paletteStore, editStore, animationStore } =
      Store.context
    const editTileGrid = document.getElementById('editTileGrid')
    const editorEl = domQueryOne('#editor')
    const editCanvas = domQueryOne('#editor canvas')
    const palette = document.getElementById('palette')
    const tilesets = document.getElementById('tilesets')
    const tools = document.getElementById('tools')

    // menu.addEventListener('click', ({ target }) => {
    //   const menuItem = target.closest('[data-menu-item]')

    //   switch (menuItem?.getAttribute('data-menu-item')) {
    //     case 'loadChr':
    //       fileStore.openFile((chrBytes) => {
    //         tileStore.assignTileset(chrBytes)
    //       })
    //       break
    //     case 'saveChr':
    //       fileStore.saveFile('patterns.chr', tileStore.tilesetBytes)
    //     default:
    //       break
    //   }
    // })

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
          case Tools.ZoomIn:
            // Zoom editor view
            editStore.zoomIn()
            break
          case Tools.ZoomOut:
            // Zoom editor view
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
      return { x, y }
    }

    editCanvas.addEventListener('pointerdown', (evt) => {
      if (![Tools.Draw, Tools.Fill].includes(editStore.tool)) return
      const pos = editPosition(evt)
      editStore.editAt(pos)
    })

    editCanvas.addEventListener('pointermove', (evt) => {
      if (editStore.tool !== Tools.Draw) return
      const pos = editPosition(evt)
      editStore.continueEdit(pos)
    })

    editorEl.addEventListener('pointerdown', (evt) => {
      if (editStore.tool !== Tools.Move) return
      const pos = editPosition(evt)
      editStore.editAt(pos)
    })

    document.addEventListener('pointerup', () => editStore.finishEdit())
  }
}
