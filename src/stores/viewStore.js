import { ButtonStyle } from '../consts.js'
import {
  domQueryOne,
  elementFromTemplate,
  isInstance,
  listenOnce
} from '../utils.js'

const viewContainerEl = domQueryOne('#viewContainer')
const viewTemplate = domQueryOne('template', viewContainerEl)

export class ViewStore {
  #stack = []
  #cancelButton = null

  constructor() {
    this.#cancelButton = {
      label: 'Cancel',
      handler: this.popView
    }
  }

  pushView = ({ title, content, buttons }) => {
    const view = elementFromTemplate(viewTemplate)

    view.querySelector('.title').replaceChildren(title)
    view.querySelector('.content').replaceChildren(content)
    view
      .querySelector('.buttons')
      .replaceChildren(...this.#renderButtons([this.#cancelButton, ...buttons]))

    if (this.#stack.length === 0) {
      viewContainerEl.appendChild(view)
      viewContainerEl.classList.remove('offDown')
    } else {
      const current = this.#stack.at(-1)

      view.classList.add('offRight')
      viewContainerEl.appendChild(view)

      requestAnimationFrame(() => {
        current.classList.add('offLeft')
        view.classList.remove('offRight')
      })
    }

    this.#stack.push(view)
  }

  popView = () => {
    if (this.#stack.length === 0) return
    const leaving = this.#stack.pop()

    if (this.#stack.length === 0) {
      viewContainerEl.classList.add('offDown')
      listenOnce(viewContainerEl, 'transitionend', () => leaving.remove())
    } else {
      const previous = this.#stack.at(-1)
      previous.classList.remove('offLeft')
      leaving.classList.add('offRight')
      listenOnce(leaving, 'transitionend', () => leaving.remove())
    }
  }

  #renderButtons = (buttons) => {
    return buttons.map(({ label, handler, style = ButtonStyle.Default }) => {
      const btn = document.createElement('button')
      btn.append(label)
      btn.onclick =
        handler ??
        (() => {
          const text = isInstance(label, Node) ? label.textContent : label
          alert(`${text} button was not assigned a handler`)
        })
      btn.classList.add(style)
      return btn
    })
  }
}
