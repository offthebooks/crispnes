import { palToHex } from './colors.js'
import { tileEditorGridSize } from './stores/editStore.js'
import { Store } from './stores/store.js'
import { tileSideLengthPixels } from './types/tile.js'
import { tilesPerTileset } from './types/tileset.js'
import { elementFromTemplate } from './utils.js'

const editTileGridEl = document.getElementById('editTileGrid')
const tilesetEl = document.getElementById('tileset')
const tileTemplateEl = document.getElementById('tileTemplate')
const paletteEls = document.querySelectorAll('#palettes .palette')
const colorTableEls = document.querySelectorAll('#colorTable i')

export class Render {
  static #dirty

  static init() {
    this.#dirty = true

    // Populate tileset canvases
    for (let i = 0; i < tilesPerTileset; ++i) {
      const el = elementFromTemplate(tileTemplateEl, 'tile')
      const canvas = el.querySelector('canvas')
      canvas.width = tileSideLengthPixels
      canvas.height = tileSideLengthPixels
      tilesetEl.append(el)
    }

    for (let i = 0; i < tileEditorGridSize; ++i) {
      const el = elementFromTemplate(tileTemplateEl, 'editTile')
      const canvas = el.querySelector('canvas')
      canvas.width = tileSideLengthPixels
      canvas.height = tileSideLengthPixels
      editTileGridEl.append(el)
    }

    // Set colors
    colorTableEls.forEach((colEl, colIndex) => {
      colEl.style.backgroundColor = palToHex[colIndex]
    })

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
      paletteStore: { palette },
      tileStore: { tileset }
    } = Store.context

    this.#renderPalettes()
    this.#renderTiles({ palette, tileset })
    this.#renderEditTiles({ palette, tileset })
    this.#dirty = false
  }

  static #renderPalettes() {
    const { palettes, paletteIndex, colorIndex } = Store.context.paletteStore

    paletteEls.forEach((palEl, palIndex) => {
      const palData = palettes[palIndex]
      const curPalette = palIndex === paletteIndex
      palEl.querySelectorAll('i').forEach((colEl, colIndex) => {
        const curColor = curPalette && colIndex === colorIndex
        colEl.style.backgroundColor = palToHex[palData[colIndex]]
        colEl.classList[curColor ? 'add' : 'remove']('active')
      })
      palEl.classList[curPalette ? 'add' : 'remove']('active')
    })

    const activeColor = palettes[paletteIndex][colorIndex]
    colorTableEls.forEach((colEl, index) =>
      colEl.classList[index === activeColor ? 'add' : 'remove']('active')
    )
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
