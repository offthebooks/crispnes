// Enums
export const Tool = Object.freeze({
  Animations: 'animations',
  Collapse: 'collapse',
  Draw: 'draw',
  Fill: 'fill',
  Move: 'move',
  Palettes: 'palettes',
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
  new Set([Tool.Draw, Tool.Fill, Tool.Move])
)
