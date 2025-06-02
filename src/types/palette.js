import { elementFromTemplate } from '../utils.js'
import { Color } from './color.js'

export const maxPaletteSize = 256

export class Palette {
  static itemTemplate = document.querySelector('#paletteItems template')

  #name
  #colors
  #item

  constructor(name) {
    this.#name = name || 'Untitled'
    this.#colors = [
      Color.Transparent,
      Color.Black,
      Color.White,
      Color.Red,
      Color.Orange,
      Color.Yellow,
      Color.Green,
      Color.Cyan,
      Color.Blue,
      Color.Purple
    ]
  }

  get name() {
    return this.#name
  }

  set name(val) {
    this.#name = val
    this.#render()
  }

  get item() {
    return this.#item ?? this.#render()
  }

  color(index) {
    return this.#colors[index]
  }

  colorListItems(selected) {
    return this.#colors.slice(1).map((color, index) => {
      const li = document.createElement('li')
      li.style.backgroundColor = color.hex
      const key = index + 1
      if (selected === key) {
        li.classList.add('active')
      }
      li.setAttribute('data-color-index', key)
      return li
    })
  }

  add(color) {
    if (this.#colors.length < maxPaletteSize) {
      this.#colors.push(color)
      this.#render()
    }
  }

  remove(index) {
    this.#colors.splice(index, 1)
  }

  #render() {
    this.#item ??= elementFromTemplate(Palette.itemTemplate)
    this.#item.querySelector('.name').textContent = this.#name
    this.#item.querySelector('.size').textContent =
      `${this.#colors.length} colors`
    return this.#item
  }
}
