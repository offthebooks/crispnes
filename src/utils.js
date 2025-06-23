export const byteString = (byte) => {
  return (256 + byte).toString(2).substring(1)
}

export const hexStringForByte = (byte) => {
  return (256 + byte).toString(16).substring(1)
}

export const clamp = (val, max, min = 0) => {
  return Math.max(Math.min(val, max), min)
}

export const ensureArray = (maybeArray) => {
  if (maybeArray == null || Array.isArray(maybeArray)) return maybeArray
  return [maybeArray]
}

// DOM Utils
export const elementIndex = (el) => {
  return Array.from(el.parentNode.children).indexOf(el)
}

export const elementFromTemplate = (templateEl, rootClass) => {
  const clone = templateEl.content.cloneNode(true)
  if (clone.children.length > 1)
    console.error('elementFromTemplate expects template with single child')
  const el = clone.children[0]
  rootClass && el.classList.add(rootClass)
  return el
}

export const domQueryOne = (selector) => document.querySelector(selector)
export const domQueryAll = (selector) => document.querySelectorAll(selector)

export const restyle = (el, styles) => Object.assign(el.style, styles)

export const resolveElements = (elementsOrSelector) => {
  if (typeof elementsOrSelector === 'string') {
    return document.querySelectorAll(elementsOrSelector)
  } else if (elementsOrSelector instanceof Element) {
    return [elementsOrSelector]
  }
  return elementsOrSelector
}

export const forElements = (elementsOrSelector, fn) => {
  const elements = resolveElements(elementsOrSelector)
  elements.forEach(fn)
  return elements
}

export const removeClass =
  (classname) =>
  ({ classList }) =>
    classList.remove(classname)
export const addClass =
  (classname) =>
  ({ classList }) =>
    classList.add(classname)

// Storage Utils
export const dataFromStorageWithKeys = (keys) => {
  const data = {}
  for (const key of keys) {
    try {
      const value = JSON.parse(window.localStorage.getItem(key))
      if (value != null) data[key] = value
    } catch (e) {
      console.error(`Error loading '${key}' from localStorage: ${e}`)
    }
  }

  return data
}

export const dataStoreObjectValuesForKeys = (obj) => {
  for (const [key, value] of Object.entries(obj))
    window.localStorage.setItem(key, JSON.stringify(value))
}

export const diffObjectValues = (nextObj, prevObj) => {
  const next = {}
  const prev = {}
  for (const key in nextObj) {
    if (nextObj[key] !== prevObj[key]) {
      next[key] = nextObj[key]
      prev[key] = prevObj[key]
    }
  }
  return { next, prev }
}
