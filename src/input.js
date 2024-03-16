import { Store } from './stores/store.js'
import { elementIndex } from './utils.js'

export class Input {
  static init() {
    const { fileStore, tileStore, paletteStore } = Store.context
    const menu = document.getElementById('menu')
    const palettes = document.getElementById('palettes')

    menu.addEventListener('click', async ({ target }) => {
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

    palettes.addEventListener('click', async ({ target }) => {
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
  }
}
