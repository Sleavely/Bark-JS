
const findSymbology = require('./symbologies')

it('is a method', () => {
  expect(findSymbology).toBeFunction()
})

it('returns symbology and remainder of code', () => {
  const result = findSymbology(`Yolo swag!`)
  expect(result).toContainKeys([
    'symbology',
    'remainingBarcode',
  ])
})

it('defaults to unknown symbology', () => {
  const result = findSymbology(`Yolo swag!`)
  expect(result.symbology).toBe('unknown')
  expect(result.remainingBarcode).toBe('Yolo swag!')
})

it.each([
  [']C1', 'GS1-128'],
  [']e0', 'GS1 DataBar'],
  [']e1', 'GS1 Composite'],
  [']e2', 'GS1 Composite'],
  [']d2', 'GS1 DataMatrix'],
  [']Q3', 'GS1 QR Code'],
])('identifies %s as %s and returns remainder', (prefix, symbology) => {
  const code = '01234567890'
  const result = findSymbology(`${prefix}${code}`)
  expect(result.symbology).toBe(symbology)
  expect(result.remainingBarcode).toBe(code)
})
