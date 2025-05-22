import { Palette } from '../types/palette.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys
} from '../utils.js'

const defaultData = Object.seal({
  selectedColor: 1,
  selectedPalette: 0,

  palettes: [new Palette()]
})

export class PaletteStore {
  #data

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
  }

  // Accessors
  get paletteIndex() {
    return this.#data.selectedPalette
  }

  get colorIndex() {
    return this.#data.selectedColor
  }

  get palettes() {
    return this.#data.palettes
  }

  get palette() {
    return this.palettes[this.paletteIndex]
  }

  get color() {
    return this.palette[this.colorIndex]
  }

  get paletteItems() {
    return this.palettes.map((p) => p.item)
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    const data = dataFromStorageWithKeys(Object.keys(defaultData))
    const { spritePalettes, backgroundPalettes } = data

    if (spritePalettes)
      data.spritePalettes = spritePalettes.map((pal) =>
        Object.assign(new Uint8Array(4), pal)
      )
    if (backgroundPalettes)
      data.backgroundPalettes = backgroundPalettes.map((pal) =>
        Object.assign(new Uint8Array(4), pal)
      )

    return data
  }
}
