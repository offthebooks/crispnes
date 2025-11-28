// Enums
export const Tool = Object.freeze({
  Clear: 'clear',
  Draw: 'draw',
  Erase: 'erase',
  Fill: 'fill',
  Redo: 'redo',
  Undo: 'undo',
  ZoomIn: 'zoomIn',
  ZoomOut: 'zoomOut'
})

export const ButtonStyle = Object.freeze({
  Default: 'default',
  Primary: 'primary',
  Danger: 'danger'
})

// Sets
export const DrawTools = Object.freeze(
  new Set([Tool.Draw, Tool.Erase, Tool.Fill])
)
