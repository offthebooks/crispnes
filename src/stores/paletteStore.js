import { Palette } from '../types/palette.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys
} from '../utils.js'
import { Store } from './store.js'

const paletteItemsEl = document.getElementById('paletteItems')
const paletteColorsEl = document.getElementById('paletteColors')

const defaultData = Object.seal({
  selectedColor: 1,
  selectedPalette: 0,

  palettes: [new Palette()]
})

export class PaletteStore {
  #data

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
    paletteItemsEl.replaceChildren(...this.paletteListItems)
    paletteColorsEl.replaceChildren(...this.paletteColorItems)
  }

  // Accessors
  get paletteIndex() {
    return this.#data.selectedPalette
  }

  get colorIndex() {
    return this.palette.selected
  }

  set colorIndex(index) {
    this.palette.selected = index
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

  get paletteListItems() {
    return this.palettes.map((p) => p.item)
  }

  get paletteColorItems() {
    return this.palette.colorItems.slice(1)
  }

  // State persistence
  #serialize() {
    const { dataStore } = Store.context
    const storeData = {
      paletteState: {
        selectedColor: this.selectedColor,
        palettes: this.palettes.map((p) => p.name)
      },
      palettes: this.palettes.map((p) => p.serialize())
    }
    dataStore.save(storeData)
  }

  #deserialize() {}
}
