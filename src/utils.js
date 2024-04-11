export const byteString = (byte) => {
  return (256 + byte).toString(2).substring(1)
}

export const stringToArray = (stringOrArrayOfStrings) => {
  return typeof stringOrArrayOfStrings === 'string'
    ? [stringOrArrayOfStrings]
    : stringOrArrayOfStrings
}

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

export const restoreDataFromStorage = (data) => {
  const keys = Object.keys(data)
  for (const key of keys) {
    try {
      const value = JSON.parse(window.localStorage.getItem(key))
      if (typeof value === 'object') Object.assign(data[key], value)
      else if (value != null) data[key] = value
    } catch (e) {
      console.error(`Error loading '${key}' from localStorage: ${e}`)
    }
  }
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
