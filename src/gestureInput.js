const getDistance = (t1, t2) =>
  Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

const getPosition = (t1, t2) => ({
  x: (t1.clientX + t2.clientX) / 2,
  y: (t1.clientY + t2.clientY) / 2
})

export class GestureInput {
  static #activeElements = new Map()

  static captureGestures({ element, onZoom, onPan }) {
    if (!element || this.#activeElements.has(element) || !onZoom || !onPan)
      return

    const touches = new Map()
    let lastDistance = null
    let lastPosition = null
    let lastGestureScale = null

    const evaluateTouches = ({ touches }) => {
      lastPosition =
        touches.length === 2 ? getPosition(...touches) : (lastPosition = null)
      lastDistance =
        touches.length === 2 ? getDistance(...touches) : (lastDistance = null)
    }

    const handlers = {
      wheel: (e) => {
        if (lastGestureScale !== null || lastDistance !== null) return
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
        if (e.touches.length !== 2) {
          lastDistance = null
          lastPosition = null
          return
        }

        const pos = getPosition(...e.touches)
        lastPosition &&
          onPan({
            x: pos.x - lastPosition.x,
            y: pos.y - lastPosition.y
          })
        lastPosition = pos

        const shouldZoom = lastGestureScale === null && lastDistance !== null
        const dist = getDistance(...e.touches)
        shouldZoom && onZoom(dist / lastDistance)
        lastDistance = dist
      },

      // Apple OS pinch to zoom
      gesturestart: () => {
        lastGestureScale = 1
      },
      gesturechange: ({ scale }) => {
        const deltaZoom = scale / lastGestureScale
        onZoom(deltaZoom)
        lastGestureScale = scale
      },
      gestureend: () => {
        lastGestureScale = null
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
