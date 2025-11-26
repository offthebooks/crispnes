import { Color } from './types/color.js'

// NES Colors: https://www.nesdev.org/wiki/PPU_palettes (indices changed)
export const nesColorPalette = [
  Color.fromGray(0, 0),
  Color.fromGray(0),
  Color.fromGray(78),
  Color.fromGray(98),
  Color.fromGray(171),
  Color.fromGray(184),
  Color.fromGray(255),

  Color.fromRGB(0, 31, 178),
  Color.fromRGB(13, 87, 255),
  Color.fromRGB(83, 174, 255),
  Color.fromRGB(182, 225, 255),

  Color.fromRGB(36, 2, 200),
  Color.fromRGB(75, 48, 255),
  Color.fromRGB(144, 133, 255),
  Color.fromRGB(206, 209, 255),

  Color.fromRGB(82, 0, 178),
  Color.fromRGB(138, 18, 255),
  Color.fromRGB(211, 101, 255),
  Color.fromRGB(233, 195, 255),

  Color.fromRGB(115, 0, 118),
  Color.fromRGB(188, 7, 214),
  Color.fromRGB(255, 87, 255),
  Color.fromRGB(255, 188, 255),

  Color.fromRGB(128, 1, 135),
  Color.fromRGB(210, 17, 106),
  Color.fromRGB(255, 92, 207),
  Color.fromRGB(255, 188, 244),

  Color.fromRGB(115, 10, 0),
  Color.fromRGB(199, 46, 0),
  Color.fromRGB(255, 119, 87),
  Color.fromRGB(255, 198, 195),

  Color.fromRGB(82, 40, 0),
  Color.fromRGB(157, 84, 0),
  Color.fromRGB(250, 158, 0),
  Color.fromRGB(255, 213, 154),

  Color.fromRGB(36, 68, 0),
  Color.fromRGB(96, 122, 0),
  Color.fromRGB(189, 200, 0),
  Color.fromRGB(233, 230, 129),

  Color.fromRGB(0, 87, 1),
  Color.fromRGB(33, 152, 1),
  Color.fromRGB(123, 231, 0),
  Color.fromRGB(206, 244, 129),

  Color.fromRGB(1, 92, 0),
  Color.fromRGB(0, 163, 0),
  Color.fromRGB(68, 246, 16),
  Color.fromRGB(182, 251, 154),

  Color.fromRGB(0, 83, 36),
  Color.fromRGB(0, 153, 66),
  Color.fromRGB(36, 239, 126),
  Color.fromRGB(169, 250, 195),

  Color.fromRGB(0, 60, 118),
  Color.fromRGB(2, 125, 180),
  Color.fromRGB(46, 212, 246),
  Color.fromRGB(169, 240, 244)
]
