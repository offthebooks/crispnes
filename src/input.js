import { Store } from './stores/store.js'
import { elementIndex } from './utils.js'

export class Input {
  static init() {
    const { fileStore, tileStore, paletteStore, editStore } = Store.context
    const menu = document.getElementById('menu')
    const editTileGrid = document.getElementById('editTileGrid')
    const palettes = document.getElementById('palettes')
    const tilesets = document.getElementById('tilesets')

    menu.addEventListener('click', ({ target }) => {
      const menuItem = target.closest('[data-menu-item]')

      switch (menuItem?.getAttribute('data-menu-item')) {
        case 'loadChr':
          fileStore.openFile((chrBytes) => {
            tileStore.assignTileset(chrBytes)
          })
          break
        case 'saveChr':
        default:
          break
      }
    })

    palettes.addEventListener('click', ({ target }) => {
      if (target.closest('#colorTable i')) {
        const ppuColor = elementIndex(target)
        paletteStore.assignColor(ppuColor)
      } else if (target.closest('.palette i')) {
        const colorIndex = elementIndex(target)
        const paletteIndex = elementIndex(target.parentNode)
        paletteStore.selectPaletteColor(paletteIndex, colorIndex)
      } else {
        palettes.classList.toggle('open')
      }
    })

    tilesets.addEventListener('click', ({ target }) => {
      const tileEl = target.closest('.tile')
      if (tileEl) {
        editStore.addTile(elementIndex(tileEl))
      } else {
        tilesets.classList.toggle('open')
      }
    })

    const editDetails = ({ target, offsetX, offsetY }) => {
      const editTile = target.closest('.editTile')
      if (!editTile) return
      const editTileIndex = elementIndex(editTile)
      const { width, height } = editTile.getBoundingClientRect()
      const x = ~~((offsetX * 8) / width)
      const y = ~~((offsetY * 8) / height)
      return { editTileIndex, x, y }
    }
    editTileGrid.addEventListener('mousedown', (evt) => {
      const info = editDetails(evt)
      if (editDetails) editStore.editAt(info)
    })
    editTileGrid.addEventListener('mousemove', (evt) => {
      const info = editDetails(evt)
      if (editDetails) editStore.continueEdit(info)
    })
    editTileGrid.addEventListener('mouseup', () => editStore.finishEdit())
    editTileGrid.addEventListener('mouseleave', () => editStore.suspendEdit())
    editTileGrid.addEventListener('mouseenter', () => editStore.resumeEdit())
  }
}
