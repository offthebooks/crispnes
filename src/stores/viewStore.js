import { ButtonStyle } from '../consts.js'
import {
  domCreate,
  domQueryOne,
  elementFromTemplate,
  listenOnce
} from '../utils.js'

const viewContainerEl = domQueryOne('#viewContainer')
const viewTemplate = domQueryOne('template', viewContainerEl)

export class ViewStore {
  #stack = []

  pushView = ({ title, content, buttons, closeLabel = 'Cancel' }) => {
    const view = elementFromTemplate(viewTemplate)

    view.querySelector('.title').replaceChildren(title)
    view.querySelector('.content').replaceChildren(content)
    view
      .querySelector('.buttons')
      .replaceChildren(
        ...this.#renderButtons([
          { label: closeLabel, handler: this.popView },
          ...buttons
        ])
      )

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

  confirm = ({ action, message, confirmed, style = ButtonStyle.Danger }) => {
    this.pushView({
      title: action + '?',
      content: domCreate({ cls: 'confirmMessage', children: message }),
      buttons: [
        {
          label: action,
          style,
          handler: () => {
            confirmed?.()
            this.popView()
          }
        }
      ]
    })
  }

  dismiss = () => {
    if (this.#stack.length === 0) return
    const leaving = this.#stack.pop()
    this.#stack.forEach((view) => view.remove())
    this.#stack = []
    viewContainerEl.classList.add('offDown')
    listenOnce(viewContainerEl, 'transitionend', () => {
      leaving.remove()
    })
  }

  #renderButtons = (buttons) =>
    buttons.map(({ label, handler, style = ButtonStyle.Default }) => {
      const btn = domCreate({ tag: 'button', cls: style })

      if (typeof label === 'string') {
        btn.innerHTML = label
      } else {
        btn.append(label)
      }

      btn.onclick =
        handler ??
        (() => alert(`${label?.textContent ?? label} not implemented`))

      return btn
    })
}
