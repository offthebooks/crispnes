const schemaMockup = {
  backdrop: 0x00, // 0x00 - 0x3f  // nes color (index 0)

  sprPalettes: [], // 4 instances of palette
  bkgPalettes: [], // 4 instances of palette

  sprTileset: {}, // instance of tileset
  bkgTileset: {}, // instance of tileset

  animations: [], // array of n animations

  screens: [] // array of screens (nametables, with attr data)

  // maps: [] // eventually, larger maps with optimizations for space/scrolling
}
