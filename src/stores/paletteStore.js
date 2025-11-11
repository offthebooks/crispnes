import { Palette } from '../types/palette.js'
import {
  domCreate,
  domQueryOne,
  untitledNameUniqueFromStrings
} from '../utils.js'
import { Store } from './store.js'

const paletteColorsEl = domQueryOne('#paletteColors')

const defaultModel = Object.seal({
  paletteList: []
})

export class PaletteStore {
  #model
  #selected
  #paletteMap

  constructor() {
    this.#model = { ...defaultModel }
    this.#selected = null
    this.#paletteMap = {}
  }

  async init() {
    const { dataStore } = Store.context
    const dataModel = await dataStore.loadPaletteData()

    if (!dataModel || !this.#loadFromDataModel(dataModel)) {
      // Populate default palette entry
      const name = 'NES Colors' //untitledNameUniqueFromStrings()
      const palette = new Palette({ name })
      this.#model.paletteList = [palette]
      this.#paletteMap = { [name]: palette }
      this.#selected = palette
      this.#persist()
    }

    // paletteItemsEl.replaceChildren(...this.paletteListItems)
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
    this.#selected = this.#model.paletteList[0]
    this.#paletteMap = paletteMap

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

  get paletteNames() {
    return this.palettes.map((p) => p.name)
  }

  get color() {
    return this.palette[this.colorIndex]
  }

  get paletteSelectOptions() {
    return this.palettes.map(({ name, length }) =>
      domCreate({
        tag: 'option',
        attrs: { value: name },
        children: `${name} - ${length} colors`
      })
    )
  }

  get paletteListItems() {
    return this.palettes.map((p) => p.item)
  }

  get paletteColorItems() {
    return this.palette.colorItems.slice(1)
  }

  get nextPaletteName() {
    return untitledNameUniqueFromStrings(this.paletteNames)
  }

  paletteForName(name) {
    return this.#paletteMap[name]
  }
}
