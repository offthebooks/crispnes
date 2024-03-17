import { palToHex } from './colors.js'
import { Store } from './stores/store.js'
import { EditTile } from './types/editTile.js'
import { tileSideLengthPixels } from './types/tile.js'
import { tilesPerTileset } from './types/tileset.js'
import { elementFromTemplate } from './utils.js'

const editorEl = document.getElementById('editor')
const editTileTemplateEl = document.getElementById('editTileTemplate')
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
      palEl.querySelectorAll('i').forEach((colEl, colIndex) => {
        colEl.style.backgroundColor = palToHex[palData[colIndex]]
      })
    })
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
    const { editTiles } = Store.context.editStore

    const editTileEls = editTiles.map(({ tileIndex, x, y }) => {
      const el = elementFromTemplate(editTileTemplateEl)
      el.style.left = `calc(50% + ${x * tileSideLengthPixels}px)`
      el.style.top = `calc(50% + ${y * tileSideLengthPixels}px)`

      const canvas = el.querySelector('canvas')
      canvas.width = tileSideLengthPixels
      canvas.height = tileSideLengthPixels

      const imgData = tileset
        .tile(tileIndex)
        .generateImageDataWithPalette(palette)
      canvas.getContext('2d').putImageData(imgData, 0, 0)

      return el
    })

    editorEl.replaceChildren(...editTileEls)
  }
}
