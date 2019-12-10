
const injectDecimal = require('./injectDecimal')

it('exports a function', () => {
  expect(injectDecimal).toBeInstanceOf(Function)
})
it('returns original string when decimal point is missing', () => {
  expect(injectDecimal('100')).toBe('100')
})
it('returns original string when decimal point is 0', () => {
  expect(injectDecimal('100', '0')).toBe('100')
})
it('injects decimal point X characters from the end', () => {
  expect(injectDecimal('100', '1')).toBe('10.0')
  expect(injectDecimal('1337', '2')).toBe('13.37')
})
it('accepts decimals at the starting position', () => {
  expect(injectDecimal('100', '3')).toBe('0.100')
  // Heck, you can even use a number larger than the string length.
  expect(injectDecimal('100', '4000')).toBe('0.100')
})
it('accepts numerical arguments, too', () => {
  expect(injectDecimal(100)).toBe('100')
  expect(injectDecimal(103, 1)).toBe('10.3')
})
