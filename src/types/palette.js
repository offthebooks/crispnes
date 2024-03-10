import { palToHex, palToRGBA } from '../nesColors.js'

export const paletteSizeBytes = 3

export class Palette {
  static #backdrop = 0x00
  #colors

  constructor() {
    this.#colors = new Uint8Array(paletteSizeBytes)
  }

  ppuColorAt = (index) => (index ? this.#colors[index - 1] : Palette.#backdrop)
  hexColorAt = (index) => palToHex[this.ppuColorAt(index)]
  rgbaColorAt = (index) => palToRGBA[this.ppuColorAt(index)]

  setColorAt(index, ppuColor) {
    this.#colors[index] = ppuColor
    this.reportDirty()
  }

  get bytes() {
    return new Uint8Array([Palette.#backdrop, ...this.#colors])
  }
}
