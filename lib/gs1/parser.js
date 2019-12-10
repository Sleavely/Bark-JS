
const findSymbology = require('./utils/symbology')
const { parseAi } = require('./applicationIdentifiers')

/**
 * @param {object} query
 * @param {string} query.barcode The barcode to parse.
 * @param {string} query.fnc The character representing FNC1. Defaults to ASCII 29 (Group Separator)
 */
const gs1Parser = ({
  barcode: originalBarcode,
  fnc = String.fromCharCode(29),
}) => {
  // First, try to derive which symbology is being used.
  // This is not important in itself since GS1 encodes data the
  // same way across all(?) symbologies, but the symbology prefix
  // length decides where the actual data in the barcode starts.
  const {
    symbology,
    remainingBarcode: barcode,
  } = findSymbology(originalBarcode)

  // Somewhere to store our scientific discoveries
  const elements = []

  // Let's iterate the code, one AI at a time.
  let currPos = 0
  while (currPos < barcode.length) {
    const ai = parseAi(barcode.slice(currPos))
    currPos += ai.ai.length

    const element = ai.parser({ barcode: barcode.slice(currPos), fnc })
    currPos += element.raw.length

    const currentElement = {
      ai: ai.ai,
      title: ai.title,
      ...element,
    }
    elements.push(currentElement)
  }
  return {
    symbology,
    elements,
    originalBarcode,
  }
}

module.exports = exports = gs1Parser
