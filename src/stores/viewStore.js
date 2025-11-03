import { ButtonStyle } from '../consts.js'
import { isInstance } from '../utils.js'

const viewEl = querySelector('#view')
const titleEl = querySelector('#view .title')
const contentEl = querySelector('#view .content')
const buttonsEl = querySelector('#view .buttons')

export class ViewStore {
  #stack = []
  #cancelButton = null

  constructor() {
    this.#cancelButton = this.#button({
      label: 'Cancel',
      handler: this.popView
    })
  }

  pushView = ({ title, content, buttons }) => {
    titleEl.replaceChildren(title)
    contentEl.replaceChildren(content)
    buttonsEl.replaceChildren([this.#cancelButton, ...buttons])
  }

  popView() {
    this.#stack.pop()
  }

  #button = ({ label, handler, style = ButtonStyle.Default }) => {
    const btn = document.createElement('button')
    btn.append(label)
    btn.onclick =
      handler ??
      (() => {
        const text = isInstance(label, Node) ? label.textContent : label
        alert(`${text} button was not assigned a handler`)
      })
    btn.classList.add(style)
    return button
  }
}
