import { tilesPerTileset } from './types/tileset.js'
import { elementFromTemplate } from './utils.js'

const tilesetEl = document.querySelector('#tileset')
const selectedTilesEl = document.querySelector('#selectedTiles')
const tileTemplateEl = document.querySelector('#tileTemplate')

export class Render {
  static #initialized

  static run() {
    if (!this.#initialized) this.#initialize()
  }

  static #initialize() {
    for (let i = 0; i < tilesPerTileset; ++i) {
      const el = elementFromTemplate(tileTemplateEl)
      const canvas = el.querySelector('canvas')
      canvas.width = tileSideLengthPixels
      canvas.height = tileSideLengthPixels
      tilesetEl.append(el)
    }

    this.#initialized = true
  }
}
