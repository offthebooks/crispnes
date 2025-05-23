import { Tools } from './enums.js'
import { Store } from './stores/store.js'
import { elementIndex } from './utils.js'

export class Input {
  static init() {
    const { fileStore, tileStore, paletteStore, editStore } = Store.context
    const menu = document.getElementById('menu')
    const editTileGrid = document.getElementById('editTileGrid')
    const palettes = document.getElementById('palettes')
    const tilesets = document.getElementById('tilesets')
    const tools = document.getElementById('tools')

    menu.addEventListener('click', ({ target }) => {
      const menuItem = target.closest('[data-menu-item]')

      switch (menuItem?.getAttribute('data-menu-item')) {
        case 'loadChr':
          fileStore.openFile((chrBytes) => {
            tileStore.assignTileset(chrBytes)
          })
          break
        case 'saveChr':
          fileStore.saveFile('patterns.chr', tileStore.tilesetBytes)
        default:
          break
      }
    })

    const exclusiveMenuToggle = ({ target }) => {
      const alreadyActive = target.parentNode.classList.contains('active')

      document.querySelector('#menu').classList.remove('active')
      document.querySelector('#animations').classList.remove('active')

      if (!alreadyActive) target.parentNode.classList.add('active')
    }

    document
      .querySelector('#menu button')
      .addEventListener('click', exclusiveMenuToggle)
    document
      .querySelector('#animationSelect')
      .addEventListener('click', exclusiveMenuToggle)

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

    // tilesets.addEventListener('click', ({ target }) => {
    //   const tileEl = target.closest('.tile')
    //   if (tileEl) {
    //     editStore.addTile(elementIndex(tileEl))
    //   } else {
    //     tilesets.classList.toggle('open')
    //   }
    // })

    const editDetails = ({ target, offsetX, offsetY }) => {
      const editTile = target.closest('.editTile')
      if (!editTile) return
      const editTileIndex = elementIndex(editTile)
      const { width, height } = editTile.getBoundingClientRect()
      const x = ~~((offsetX * 8) / width)
      const y = ~~((offsetY * 8) / height)
      return { editTileIndex, x, y }
    }
    editTileGrid.addEventListener('click', ({ target }) => {
      if (editStore.tool !== Tools.Move) return
      const btn = target.closest('button')
      if (!btn) return
      const editTileEl = target.closest('.editTile')
      const editTileIndex = editTileEl && elementIndex(editTileEl)
      if (btn.querySelector('.unlinkIcon')) {
        editStore.removeTile(editTileIndex)
      } else if (btn.querySelector('.clearIcon')) {
        editStore.clearTile(editTileIndex)
      }
    })
    editTileGrid.addEventListener('pointerdown', (evt) => {
      if (editStore.tool === Tools.Move) return
      const info = editDetails(evt)
      if (editDetails) editStore.editAt(info)
    })
    editTileGrid.addEventListener('pointermove', (evt) => {
      const info = editDetails(evt)
      if (editDetails) editStore.continueEdit(info)
    })
    document.addEventListener('pointerup', () => editStore.finishEdit())

    tools.addEventListener('click', ({ target }) => {
      const toolEl = target.closest('button')?.querySelector('i')
      if (toolEl?.classList.contains('drawIcon')) {
        editStore.tool = Tools.Draw
      } else if (toolEl?.classList.contains('fillIcon')) {
        editStore.tool = Tools.Fill
      } else if (toolEl?.classList.contains('moveIcon')) {
        editStore.tool = Tools.Move
      } else {
        tools.classList.toggle('open')
      }
    })
  }
}
