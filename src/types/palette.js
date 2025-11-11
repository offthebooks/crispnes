import { nesColorPalette } from '../colors.js'
import { Store } from '../stores/store.js'
import { domCreate, domQueryOne, elementFromTemplate } from '../utils.js'
import { Color } from './color.js'

export const maxPaletteSize = 256

const defaultModel = Object.seal({
  name: null,
  colors: nesColorPalette
})

export class Palette {
  static itemTemplate = domQueryOne('#paletteItem')

  #model
  #selected
  #DOM

  constructor(model = {}) {
    const name = model.name ?? Store.context.paletteStore.nextPaletteName
    const colors = model.colors ?? Color.cloneArray(defaultModel.colors)
    this.#model = { name, colors }
    this.#selected = 1 // First non-background color
    this.#DOM = { item: null, colorItems: null }
  }

  static fromDataModel = ({ name, colors }) => {
    return new Palette({ name, colors: colors.map(Color.fromDataModel) })
  }

  get dataModel() {
    const { name, colors } = this.#model
    return { name, colors: colors.map((c) => c.dataModel) }
  }

  get name() {
    return this.#model.name
  }

  set name(val) {
    this.#model.name = val
    this.#render()
  }

  get selected() {
    return this.#selected
  }

  set selected(colorIndex) {
    this.colorItems[this.selected].classList.remove('selected')
    this.colorItems[colorIndex].classList.add('selected')
    this.#selected = colorIndex
  }

  get item() {
    return this.#DOM.item ?? this.#render().item
  }

  get colorItems() {
    return this.#DOM.colorItems ?? this.#render().colorItems
  }

  get length() {
    return this.#model.colors.length
  }

  color(index) {
    return this.#model.colors[index]
  }

  add(color) {
    if (this.#model.colors.length < maxPaletteSize) {
      this.#model.colors.push(color)
      this.#render()
    }
  }

  remove(index) {
    this.#model.colors.splice(index, 1)
  }

  #render() {
    this.#DOM.item ??= elementFromTemplate(Palette.itemTemplate)
    const { item } = this.#DOM
    item.querySelector('.name').textContent = this.name
    item.querySelector('.size').textContent = `${this.length} colors`

    this.#DOM.colorItems = this.#model.colors.map((color, index) =>
      domCreate({
        tag: 'li',
        cls: this.selected === index ? 'selected' : null,
        styles: {
          backgroundColor: color.hex
        },
        attrs: {
          'data-color-index': index
        }
      })
    )

    return { ...this.#DOM }
  }
}
