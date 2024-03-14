import { Bank } from '../enums.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys
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

  get palettes() {
    const { bank } = Store.context.editStore
    return this.#data[
      bank === Bank.Sprite ? 'spritePalettes' : 'backgroundPalettes'
    ]
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
    this.serialize(changed.next)
  }

  assignColor(ppuColor) {
    // Needs to know from the editorStore whether we're currently concerned with
    // Sprite or Background character data
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    const data = dataFromStorageWithKeys(Object.keys(defaultData))
    const { spritePalettes, backgroundPalettes } = data

    if (spritePalettes) data.spritePalettes = new Uint8Array(spritePalettes)
    if (backgroundPalettes)
      data.backgroundPalettes = new Uint8Array(backgroundPalettes)

    return data
  }
}
