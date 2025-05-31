// Enums
export const Tools = Object.freeze({
  Animations: 'animations',
  Collapse: 'collapse',
  Draw: 'draw',
  Fill: 'fill',
  Move: 'move',
  Palettes: 'palettes',
  ZoomIn: 'zoomIn',
  ZoomOut: 'zoomOut'
})

// Sets
export const DrawTools = Object.freeze(
  new Set([Tools.Draw, Tools.Fill, Tools.Move])
)
