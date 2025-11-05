// Math Utils
export const clamp = (val, max, min = 0) => {
  return Math.max(Math.min(val, max), min)
}

// String Utils
export const byteString = (byte) => {
  return (256 + byte).toString(2).substring(1)
}

export const hexStringForByte = (byte) => {
  return (256 + byte).toString(16).substring(1)
}

export const dateString = () => {
  const iso = new Date().toISOString()
  return iso.replace(/[-:T]/g, '').split('.')[0]
}

export const untitledNameUniqueFromStrings = (existingNames = []) => {
  let num = existingNames.length
  let name
  do {
    name = `Untitled ${++num}`
  } while (existingNames.includes(name))
  return name
}

export const formatJSON = (value) => JSON.stringify(value, undefined, '  ')

export const describeType = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  return Object.prototype.toString.call(value).slice(8, -1)
}

// DOM Utils
export const elementIndex = (el) => {
  return Array.from(el.parentNode.children).indexOf(el)
}

export const elementFromTemplate = (templateEl, rootClass) => {
  const { children } = templateEl.content.cloneNode(true)
  if (children.length > 1)
    console.error('elementFromTemplate expects template with single child')
  const [el] = children
  rootClass && el.classList.add(rootClass)
  return el
}

export const domQueryOne = (selector, scope = document) =>
  scope.querySelector(selector)
export const domQueryAll = (selector, scope = document) =>
  scope.querySelectorAll(selector)

const sizeTags = new Set(['canvas', 'img'])

export const domCreate = ({
  tag = 'div',
  cls,
  id,
  w,
  h,
  styles = {},
  attrs = {}
}) => {
  const tagname = tag.toLowerCase()
  const el = document.createElement(tagname)
  if (id) el.id = id
  if (cls) el.className = Array.isArray(cls) ? cls.join(' ') : cls
  if (typeof w === 'number' && sizeTags.has(tagname)) el.width = w
  if (typeof h === 'number' && sizeTags.has(tagname)) el.height = h
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
  restyle(el, styles)
  return el
}

export const restyle = (el, styles = {}) => Object.assign(el.style, styles)

export const isInstance = (el, type) => el instanceof type
export const isCanvas = (el) => isInstance(el, HTMLCanvasElement)

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

export const listenOnce = (el, evt, fn) =>
  el.addEventListener(evt, fn, { once: true })

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
