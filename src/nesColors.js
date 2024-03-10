// Lookup tables for working with indices for color
// values for 2C02 (NTSC) PPU referenced here:
// https://www.nesdev.org/wiki/PPU_palettes

// prettier-ignore
export const palToHex = [
  // $00 - $0F
  '#626262', '#001FB2', '#2404C8', '#5200B2', '#730076', '#800024', '#730B00', '#522800',
  '#244400', '#005700', '#005C00', '#005324', '#003C76', '#000000', '#000000', '#000000',

  // $10 - $1F
  '#ABABAB', '#0D57FF', '#4B30FF', '#8A13FF', '#BC08D6', '#D21269', '#C72E00', '#9D5400',
  '#607B00', '#209800', '#00A300', '#009942', '#007DB4', '#000000', '#000000', '#000000',

  // $20 - $2F
  '#FFFFFF', '#53AEFF', '#9085FF', '#D365FF', '#FF57FF', '#FF5DCF', '#FF7757', '#FA9E00',
  '#BDC700', '#7AE700', '#43F611', '#26EF7E', '#2CD5F6', '#4E4E4E', '#000000', '#000000',

  // $30 - $3F
  '#FFFFFF', '#B6E1FF', '#CED1FF', '#E9C3FF', '#FFBCFF', '#FFBDF4', '#FFC6C3', '#FFD59A',
  '#E9E681', '#CEF481', '#B6FB9A', '#A9FAC3', '#A9F0F4', '#B8B8B8', '#000000', '#000000'
]

// prettier-ignore
export const palToRGBA = [
  // $00 - $0F
  0x626262ff, 0x001fb2ff, 0x2404c8ff, 0x5200b2ff, 0x730076ff, 0x800024ff, 0x730b00ff, 0x522800ff,
  0x244400ff, 0x005700ff, 0x005c00ff, 0x005324ff, 0x003c76ff, 0x000000ff, 0x000000ff, 0x000000ff,

  // $10 - $1F
  0xabababff, 0x0d57ffff, 0x4b30ffff, 0x8a13ffff, 0xbc08d6ff, 0xd21269ff, 0xc72e00ff, 0x9d5400ff,
  0x607b00ff, 0x209800ff, 0x00a300ff, 0x009942ff, 0x007db4ff, 0x000000ff, 0x000000ff, 0x000000ff,

  // $20 - $2F
  0xffffffff, 0x53aeffff, 0x9085ffff, 0xd365ffff, 0xff57ffff, 0xff5dcfff, 0xff7757ff, 0xfa9e00ff,
  0xbdc700ff, 0x7ae700ff, 0x43f611ff, 0x26ef7eff, 0x2cd5f6ff, 0x4e4e4eff, 0x000000ff, 0x000000ff,

  // $30 - $3F
  0xffffffff, 0xb6e1ffff, 0xced1ffff, 0xe9c3ffff, 0xffbcffff, 0xffbdf4ff, 0xffc6c3ff, 0xffd59aff,
  0xe9e681ff, 0xcef481ff, 0xb6fb9aff, 0xa9fac3ff, 0xa9f0f4ff, 0xb8b8b8ff, 0x000000ff, 0x000000ff
]
