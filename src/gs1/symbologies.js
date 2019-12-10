
/**
 * Looks at the start of a barcode to identify
 * the type of GS1 symbology is being read.
 *
 * @param {string} originalBarcode
 * @return {obj} The symbology name and part of barcode that remains to be parsed.
 */
const findSymbology = (originalBarcode) => {
  const symbologies = [
    { prefix: ']C1', name: 'GS1-128' },
    { prefix: ']e0', name: 'GS1 DataBar' },
    { prefix: ']e1', name: 'GS1 Composite' },
    { prefix: ']e2', name: 'GS1 Composite' },
    { prefix: ']d2', name: 'GS1 DataMatrix' },
    { prefix: ']Q3', name: 'GS1 QR Code' },
  ]

  const symbologyUsed = symbologies.find(({ prefix }) => originalBarcode.startsWith(prefix))
  if (symbologyUsed) {
    return {
      symbology: symbologyUsed.name,
      remainingBarcode: originalBarcode.slice(symbologyUsed.prefix.length),
    }
  }
  return {
    symbology: 'unknown',
    remainingBarcode: originalBarcode,
  }
}

module.exports = exports = findSymbology
