import { Color } from './color.js'

export const maxPaletteSize = 256

export class Palette {
  static itemTemplate = document.getElementById('paletteItemTemplate')

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
  }

  get item() {
    if (!this.#el) {
      const tileTemplateEl = 
    }
  }

  color(index) {
    return this.#colors[index]
  }

  add(color) {
    if (this.#colors.length < maxPaletteSize) {
      this.#colors.push(color)
    }
  }

  remove(index) {
    this.#colors.splice(index, 1)
  }
}
