
const gs1Parser = require('./gs1/parser')

const bark = (barcode, settings = {}) => {
  let input = barcode

  const defaults = {
    assumeGtin: false,
    fnc: String.fromCharCode(29),
  }
  const options = {
    ...defaults,
    ...settings,
  }

  // Do we even want to try to infere a GTIN?
  if (options.assumeGtin) {
    const digitsOnly = /^\d+$/.test(input)
    if (digitsOnly) {
      if (input.length >= 11 && input.length <= 14) {
        // We'll assume its one of UPC-A, EAN-13, ITF-14
        input = `01${input.padStart(14, '0')}`
      }
    }
  }

  return gs1Parser({ barcode: input, fnc: options.fnc })
}

module.exports = exports = bark
