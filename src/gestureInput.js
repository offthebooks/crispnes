function getDistance(p1, p2) {
  const dx = p2.clientX - p1.clientX
  const dy = p2.clientY - p1.clientY
  return Math.hypot(dx, dy)
}

function sharedHandlers(state) {
  const { element, pointers, onZoom, onPan } = state
  const pointerDelete = (e) => {
    pointers.delete(e.pointerId)
    state.lastDistance = null
  }
  return {
    pointerdown: (e) => {
      pointers.set(e.pointerId, e)
      element.setPointerCapture(e.pointerId)
    },
    pointermove: (e) => {
      if (!pointers.has(e.pointerId)) return

      pointers.set(e.pointerId, e)

      if (pointers.size !== 2) return

      const [p1, p2] = Array.from(pointers.values())

      if (typeof onZoom === 'function') {
        const distance = getDistance(p1, p2)
        state.lastDistance !== null && onZoom(distance / state.lastDistance)
        state.lastDistance = distance
      }
      if (typeof onPan === 'function') {
        const x = (p1.movementX + p2.movementX) / 2
        const y = (p1.movementY + p2.movementY) / 2
        onPan({ x, y })
      }
    },
    pointerup: pointerDelete,
    pointercancel: pointerDelete
  }
}

function zoomHandlers(state) {
  const { onZoom } = state
  if (typeof onZoom !== 'function') return {}

  return {
    wheel: (e) => {
      if (e.ctrlKey) {
        onZoom(Math.exp(e.deltaY * 0.01))
        e.preventDefault()
      }
    },
    touchmove: (e) => {
      if (e.touches.length !== 2) return

      const distance = getDistance(...e.touches)
      state.lastDistance !== null && onZoom(distance / state.lastDistance)
      state.lastDistance = distance
      e.preventDefault()
    }
  }
}

export class GestureInput {
  static #activeElements = new Map()

  static captureGestures({ element, onZoom, onPan }) {
    if (!element || this.#activeElements.has(element) || !(onZoom || onPan))
      return

    const state = {
      element,
      onZoom,
      onPan,
      pointers: new Map(),
      lastDistance: null
    }

    const handlers = {
      ...sharedHandlers(state),
      ...zoomHandlers(state)
    }

    for (const [type, fn] of Object.entries(handlers)) {
      element.addEventListener(type, fn)
    }

    this.#activeElements.set(element, handlers)
  }

  static releaseGestures({ element }) {
    const handlers = this.#activeElements.get(element)
    if (!handlers) return

    for (const [type, fn] of Object.entries(handlers)) {
      element.removeEventListener(type, fn)
    }

    this.#activeElements.delete(element)
  }
}
