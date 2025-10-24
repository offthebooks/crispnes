import { nesColorPalette } from '../colors.js'
import { elementFromTemplate } from '../utils.js'

export const maxPaletteSize = 256

const defaultModel = Object.seal({
  name: 'Untitled',
  colors: nesColorPalette
})

export class Palette {
  static itemTemplate = document.querySelector('#paletteItems template')

  #model
  #selected
  #DOM

  constructor(model = {}) {
    const name = model.name ?? defaultModel.name
    const colors = model.colors ?? Color.cloneArray(defaultModel.colors)
    this.#model = { name, colors }
    this.#DOM = { item: '', colorItems: '' }
  }

  static fromDataModel = ({ name, colors }) => {
    return new Palette({ name, colors: colors.map(colors.fromDataModel) })
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

  serialize() {}

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

    this.#DOM.colorItems = this.#model.colors.map((color, index) => {
      const li = document.createElement('li')
      li.style.backgroundColor = color.hex
      li.setAttribute('data-color-index', index)
      if (this.selected === index) {
        li.classList.add('selected')
      }
      return li
    })

    return { ...this.#DOM }
  }
}
