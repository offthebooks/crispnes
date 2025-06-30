import { tileEditorGridSize } from './stores/editStore.js'
import { Store } from './stores/store.js'
import { elementFromTemplate } from './utils.js'

const editTileGridEl = document.getElementById('editTileGrid')
const editTileTemplateEl = document.getElementById('editTileTemplate')
const tilesetEl = document.getElementById('tileset')
const tileTemplateEl = document.getElementById('tileTemplate')
const paletteEls = document.querySelectorAll('#palettes .palette')
const colorTableEls = document.querySelectorAll('#colorTable i')

export class Render {
  static #dirty

  static init() {
    this.#dirty = true

    const {
      animationStore: { animationItems },
      paletteStore: { paletteItems }
    } = Store.context

    // Populate items lists
    const animationItemsList = document.getElementById('animationItems')
    animationItemsList.replaceChildren(...animationItems)

    const tick = () => {
      if (this.#dirty) this.#render()
      window.requestAnimationFrame(tick)
    }

    tick()
  }

  static setDirty() {
    this.#dirty = true
  }

  static #render() {
    const {
      paletteStore: { palette }
    } = Store.context

    // this.#renderPalettes()
    // this.#renderTiles({ palette, tileset })
    // this.#renderEditTiles({ palette, tileset })
    this.#dirty = false
  }

  static #renderTiles({ palette, tileset }) {
    const tileEls = tilesetEl.querySelectorAll('.tile')

    tileEls.forEach((el, index) => {
      const tile = tileset.tile(index)
      const canvas = el.querySelector('canvas')
      const imgData = tile.generateImageDataWithPalette(palette)
      canvas.getContext('2d').putImageData(imgData, 0, 0)
    })
  }

  static #renderEditTiles({ palette, tileset }) {
    const { editStore } = Store.context

    const editTileEls = [...editTileGridEl.children]
    editTileGridEl.setAttribute('data-tool', editStore.tool)
    editTileEls.forEach((el, editTileIndex) => {
      const tileIndex = editStore.tileIndexForEditTile(editTileIndex)
      const canvas = el.querySelector('canvas')
      const context = canvas.getContext('2d')

      if (tileIndex === -1) {
        context.clearRect(0, 0, tileSideLengthPixels, tileSideLengthPixels)
      } else {
        const imgData = tileset
          .tile(tileIndex)
          .generateImageDataWithPalette(palette)
        context.putImageData(imgData, 0, 0)
      }
    })
  }
}
