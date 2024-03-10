import { MetaSprite } from './metaSprite.js'

export class Animation {
  name
  frameHoldCount
  #frames

  constructor() {
    this.name = 'Untitled'
    this.#frames = []
  }

  add() {
    this.#frames.push(new MetaSprite())
  }

  remove(index) {
    this.#frames.splice(index, 1)
  }

  sprite(index) {
    return this.#frames[index]
  }
}
