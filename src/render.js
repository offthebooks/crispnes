import { palToHex } from './nesColors.js'
import { Store } from './stores/store.js'
import { tileSideLengthPixels } from './types/tile.js'
import { tilesPerTileset } from './types/tileset.js'
import { elementFromTemplate } from './utils.js'

const tilesetEl = document.querySelector('#tileset')
const tileTemplateEl = document.querySelector('#tileTemplate')
const paletteEls = document.querySelectorAll('#palettes .palette')
const colorTableEls = document.querySelectorAll('#colorTable i')

export class Render {
  static #dirty

  static init() {
    this.#dirty = true

    // Populate tileset canvases
    for (let i = 0; i < tilesPerTileset; ++i) {
      const el = elementFromTemplate(tileTemplateEl)
      const canvas = el.querySelector('canvas')
      canvas.width = tileSideLengthPixels
      canvas.height = tileSideLengthPixels
      tilesetEl.append(el)
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

  static #render() {
    this.#renderPalettes()
    this.#renderTiles()
    this.#dirty = false
  }

  static #renderPalettes() {
    const { palettes, paletteIndex, colorIndex } = Store.context.paletteStore

    paletteEls.forEach((palEl, palIndex) => {
      const palData = palettes[palIndex]
      palEl.querySelectorAll('i').forEach((colEl, colIndex) => {
        colEl.style.backgroundColor = palToHex[palData[colIndex]]
      })
    })
  }

  static #renderTiles() {
    const tileEls = tilesetEl.querySelectorAll('.tile')
    const { palette } = Store.context.paletteStore
    const { tileset } = Store.context.tileStore

    tileEls.forEach((el, index) => {
      const tile = tileset.tile(index)
      const canvas = el.querySelector('canvas')
      const imgData = tile.generateImageDataWithPalette(palette)
      canvas.getContext('2d').putImageData(imgData, 0, 0)
    })
  }
}
