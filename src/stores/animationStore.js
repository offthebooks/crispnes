import { Animation } from '../types/animation.js'

export class AnimationStore {
  #animations

  constructor() {
    this.#animations = [new Animation('Untitled', 16, 16)]
  }

  get animations() {
    return Object.freeze([...this.#animations])
  }

  // Mutations
  addAnimation(name, width, height) {
    this.#animations.push(new Animation(name, width, height))
  }
}
