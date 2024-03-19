import { Bank } from '../enums.js'
import { Render } from '../render.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys,
  diffObjectValues
} from '../utils.js'
import { Store } from './store.js'

const defaultData = Object.seal({
  selectedColor: 3,
  selectedPalette: 0,

  spritePalettes: [
    new Uint8Array([0x0f, 0x08, 0x28, 0x38]),
    new Uint8Array([0x0f, 0x16, 0x26, 0x36]),
    new Uint8Array([0x0f, 0x03, 0x23, 0x33]),
    new Uint8Array([0x0f, 0x0c, 0x1c, 0x31])
  ],

  backgroundPalettes: [
    new Uint8Array([0x0f, 0x08, 0x28, 0x38]),
    new Uint8Array([0x0f, 0x16, 0x26, 0x36]),
    new Uint8Array([0x0f, 0x03, 0x23, 0x33]),
    new Uint8Array([0x0f, 0x0c, 0x1c, 0x31])
  ]
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

  get #palettesKey() {
    const { bank } = Store.context.editStore
    return bank === Bank.Sprite ? 'spritePalettes' : 'backgroundPalettes'
  }

  get palettes() {
    return this.#data[this.#palettesKey]
  }

  get palette() {
    return this.palettes[this.paletteIndex]
  }

  get color() {
    return this.palette[this.colorIndex]
  }

  // Mutations
  selectPaletteColor(selectedPalette, selectedColor) {
    const changed = diffObjectValues(
      { selectedPalette, selectedColor },
      this.#data
    )
    Object.assign(this.#data, changed.next)
    this.serialize(changed.next)
    Render.setDirty()
  }

  assignColor(ppuColor) {
    if (this.colorIndex === 0) {
      this.#data.spritePalettes.forEach((pal) => (pal[0] = ppuColor))
      this.#data.backgroundPalettes.forEach((pal) => (pal[0] = ppuColor))
    } else this.palette[this.colorIndex] = ppuColor

    this.serialize({ [this.#palettesKey]: this.palettes })
    Render.setDirty()
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
