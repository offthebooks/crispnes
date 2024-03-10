import { Sprite } from './sprite.js'

export class MetaSprite {
  #sprites

  constructor() {
    this.#sprites = []
  }

  add() {
    this.#sprites.push(new Sprite())
  }

  remove(index) {
    this.#sprites.splice(index, 1)
  }

  sprite(index) {
    return this.#sprites[index]
  }
}
