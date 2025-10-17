import { nesColorPalette } from '../colors.js'
import { elementFromTemplate } from '../utils.js'

export const maxPaletteSize = 256

const defaultData = Object.seal({
  name: 'Untitled',
  selected: 1,
  colors: nesColorPalette
})

export class Palette {
  static itemTemplate = document.querySelector('#paletteItems template')

  #data
  #item
  #colorItems

  constructor(name) {
    this.#data = { ...defaultData }
  }

  get name() {
    return this.#data.name
  }

  set name(val) {
    this.#data.name = val
    this.#render()
  }

  get selected() {
    return this.#data.selected
  }

  set selected(index) {
    this.colorItems[this.selected].classList.remove('active')
    this.colorItems[index].classList.add('active')
    this.#data.selected = index
  }

  get item() {
    return this.#item ?? this.#render().item
  }

  get colorItems() {
    return this.#colorItems ?? this.#render().colorItems
  }

  get length() {
    return this.#data.colors.length
  }

  color(index) {
    return this.#data.colors[index]
  }

  add(color) {
    if (this.#data.colors.length < maxPaletteSize) {
      this.#data.colors.push(color)
      this.#render()
    }
  }

  remove(index) {
    this.#data.colors.splice(index, 1)
  }

  #render() {
    this.#item ??= elementFromTemplate(Palette.itemTemplate)
    this.#item.querySelector('.name').textContent = this.name
    this.#item.querySelector('.size').textContent = `${this.length} colors`

    this.#colorItems = this.#data.colors.map((color, index) => {
      const li = document.createElement('li')
      li.style.backgroundColor = color.hex
      li.setAttribute('data-color-index', index)
      if (this.selected === index) {
        li.classList.add('active')
      }
      return li
    })

    return { item: this.#item, colorItems: this.#colorItems }
  }
}
