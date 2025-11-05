import { ButtonStyle } from '../consts.js'
import { domQueryOne, elementFromTemplate, isInstance } from '../utils.js'

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
      view.classList.add('offDown')
      viewContainerEl.appendChild(view)
      requestAnimationFrame(() => {
        view.classList.remove('offDown')
      })
    } else {
      const current = this.#stack.at(-1).el

      view.classList.add('offRight')
      viewContainerEl.appendChild(view)

      requestAnimationFrame(() => {
        current.classList.add('offLeft')
        view.classList.remove('offRight')
      })
    }

    this.#stack.push({ el: view, title, content, buttons })
  }

  popView = () => {
    if (this.#stack.length === 0) return
    const leaving = this.#stack.pop().el

    if (this.#stack.length === 0) {
      leaving.classList.add('offDown')
      leaving.addEventListener('transitionend', () => leaving.remove(), {
        once: true
      })
    } else {
      const previous = this.#stack[this.#stack.length - 1].el
      leaving.classList.add('offRight')
      leaving.addEventListener('transitionend', () => leaving.remove(), {
        once: true
      })

      previous.classList.remove('offLeft')
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
