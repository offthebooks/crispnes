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

  get length() {
    return this.#stack.length
  }

  get current() {
    return this.length ? this.#stack.at(-1) : null
  }

  pushView = ({ title, content, buttons, closeLabel = 'Cancel' }) => {
    const view = elementFromTemplate(viewTemplate)
    const { current } = this

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

    if (!current) {
      viewContainerEl.appendChild(view)
      viewContainerEl.showModal()
      requestAnimationFrame(() => {
        viewContainerEl.classList.remove('offDown')
      })
    } else {
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
    if (this.length <= 1) return this.dismiss()

    const leaving = this.#stack.pop()
    const previous = this.current
    previous.classList.remove('offLeft')
    leaving.classList.add('offRight')
    listenOnce(leaving, 'transitionend', () => leaving.remove())
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
    if (this.length === 0) return
    const leaving = this.#stack.pop()
    this.#stack.forEach((view) => view.remove())
    this.#stack = []
    viewContainerEl.classList.add('offDown')
    listenOnce(viewContainerEl, 'transitionend', () => {
      viewContainerEl.close()
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
