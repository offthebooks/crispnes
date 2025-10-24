import { Palette } from '../types/palette.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys
} from '../utils.js'
import { Store } from './store.js'

const paletteItemsEl = document.getElementById('paletteItems')
const paletteColorsEl = document.getElementById('paletteColors')

const defaultData = Object.seal({
  // This selected palette is for the palette list
  // In-use pallete is associated with the current animation
  selectedPalette: null,
  paletteList: [],
  paletteMap: {}
})

export class PaletteStore {
  #data

  constructor() {
    this.#data = { ...defaultData }
  }

  async init() {
    await this.#deserialize()
    paletteItemsEl.replaceChildren(...this.paletteListItems)
    paletteColorsEl.replaceChildren(...this.paletteColorItems)
  }

  // Accessors
  get colorIndex() {
    return this.palette.selected
  }

  set colorIndex(index) {
    this.palette.selected = index
  }

  get palettes() {
    return this.#data.paletteList
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

  get nextPaletteName() {
    let num = this.palettes.length
    let name
    do {
      name = `Untitled ${num++}`
    } while (this.paletteForName(name))
    return name
  }

  paletteForName(name) {
    return this.#data.paletteMap[name]
  }

  // State persistence
  #serialize() {
    const { dataStore } = Store.context
    const paletteData = {
      paletteState: {
        paletteList: this.palettes.map((p) => p.name)
      },
      palettes: this.palettes.map((p) => p.serialize())
    }
    dataStore.save(paletteData)
  }

  async #deserialize() {
    const { dataStore } = Store.context
    const {
      paletteState: { paletteList },
      palettes
    } = await dataStore.loadPaletteData()

    if (!paletteList || !palettes) return

    const paletteMap = Object.fromEntries(
      paletteData.palettes.map((p) => {
        const colors = p.colors.map((bytes) => new Color({ bytes }))
        const palette = new Palette({ name: p.name, colors })
        return [p.name, palette]
      })
    )

    this.#data.paletteList = paletteList.map((name) => paletteMap[name])
    this.#data.paletteMap = paletteMap
    this.#data.selectedPalette = this.#data.paletteList[0]
  }
}
