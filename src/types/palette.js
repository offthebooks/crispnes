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
    this.#colors = [Color.Transparent, Color.Black, Color.White]
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
    this.#item.querySelector('.name').innerText = this.#name
    this.#item.querySelector('.size').innerText =
      `${this.#colors.length} colors`
    return this.#item
  }
}
