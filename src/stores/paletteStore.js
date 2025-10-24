import { Palette } from '../types/palette.js'
import { Store } from './store.js'

const paletteItemsEl = document.getElementById('paletteItems')
const paletteColorsEl = document.getElementById('paletteColors')

const defaultModel = Object.seal({
  paletteList: []
})

export class PaletteStore {
  #model
  #selected
  #paletteMap // Convenience for finding palettes by name

  constructor() {
    this.#model = { ...defaultModel }
    this.#selected = null
    this.#paletteMap = {}
  }

  async init() {
    const { dataStore } = Store.context
    const dataModel = await dataStore.loadPaletteData()

    if (!this.#loadFromDataModel(dataModel)) {
      // Populate default palette entry
      const { nextPaletteName: name } = this
      const palette = new Palette({ name })
      this.#model.paletteList = [palette]
      this.#paletteMap = { name: palette }
      this.selected = palette
      this.#persist()
    }

    paletteItemsEl.replaceChildren(...this.paletteListItems)
    paletteColorsEl.replaceChildren(...this.paletteColorItems)
  }

  #loadFromDataModel(dataModel) {
    const {
      paletteState: { paletteList },
      palettes
    } = dataModel

    if (!paletteList || !palettes) return false

    const paletteMap = Object.fromEntries(
      palettes.map((dataModel) => {
        const palette = Palette.fromDataModel(dataModel)
        return [palette.name, palette]
      })
    )

    this.#model.paletteList = paletteList.map((name) => paletteMap[name])
    this.selected = this.#model.paletteList[0]
    this.paletteMap = paletteMap

    return true
  }

  #persist() {
    const { dataStore } = Store.context
    dataStore.save(this.dataModel)
  }

  // Accessors
  get dataModel() {
    return {
      paletteState: {
        paletteList: this.palettes.map((p) => p.name)
      },
      palettes: this.palettes.map((p) => p.dataModel)
    }
  }

  get colorIndex() {
    return this.palette.selected
  }

  set colorIndex(index) {
    this.palette.selected = index
  }

  get palettes() {
    return this.#model.paletteList
  }

  get palette() {
    return this.#selected
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
    return this.#paletteMap[name]
  }
}
