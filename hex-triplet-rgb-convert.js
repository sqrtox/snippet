const hexTripletToRgb = hexTriplet => {
  if (hexTriplet < 0 || hexTriplet > 0xffffff) {
    throw new RangeError('Invalid range')
  }

  return [
    hexTriplet >> 16,
    hexTriplet >> 8 & 0xff,
    hexTriplet & 0xff
  ]
}

const rgbToHexTriplet = ([r, g, b]) => {
  if (
    r < 0 || r > 0xff ||
    g < 0 || g > 0xff ||
    b < 0 || b > 0xff
  ) {
    throw new RangeError('Invalid range')
  }

  return (r << 16) + (g << 8) + b
}
