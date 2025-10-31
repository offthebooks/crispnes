const getDistance = (t1, t2) =>
  Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

const getPosition = (t1, t2) => ({
  x: (t1.clientX + t2.clientX) / 2,
  y: (t1.clientY + t2.clientY) / 2
})

const evaluateTouches = ({ touches }) => {
  state.lastPosition =
    touches.length === 2 ? getPosition(...touches) : (state.lastPosition = null)
}

export class GestureInput {
  static #activeElements = new Map()

  static captureGestures({ element, onZoom, onPan }) {
    if (!element || this.#activeElements.has(element) || !onZoom || !onPan)
      return

    const state = {
      element,
      onZoom,
      onPan,
      touches: new Map(),
      lastDistance: null,
      lastPosition: null,
      lastGestureScale: null
    }

    const handlers = {
      wheel: (e) => {
        onZoom(Math.exp(e.deltaY * 0.01))
        e.preventDefault()
      },

      mousemove: ({ buttons, movementX: x, movementY: y }) => {
        if (buttons & 2) {
          onPan({ x, y })
        }
      },

      // Generic touch screen pan/zoom
      touchstart: evaluateTouches,
      touchend: evaluateTouches,
      touchmove: (e) => {
        if (e.touches.length !== 2) return

        const pos = getPosition(...e.touches)
        state.lastPosition &&
          onPan({
            x: pos.x - state.lastPosition.x,
            y: pos.y - state.lastPosition.y
          })
        state.lastPosition = pos

        const dist = getDistance(...e.touches)
        state.lastDistance && onZoom(dist / state.lastDistance)
        state.lastDistance = dist
      },

      // Apple OS pinch to zoom
      gesturestart: () => {
        state.lastGestureScale = 1
      },
      gesturechange: ({ scale }) => {
        const deltaZoom = scale / state.lastGestureScale
        onZoom(deltaZoom)
        state.lastGestureScale = scale
      },
      gestureend: () => {
        state.lastGestureScale = null
      }
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
