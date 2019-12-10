
const {
  fixedLength,
  variableLength,
  variableLengthDecimal,
  fixedLengthDecimal,
  variableLengthISOCurrency,
  variableLengthISOCountry,
  date,
} = require('./dataReaders')

it('has tests for all exported parsers', () => {
  expect(Object.keys(require('./dataReaders'))).toEqual([
    'fixedLength',
    'variableLength',
    'fixedLengthDecimal',
    'variableLengthDecimal',
    'variableLengthISOCurrency',
    'variableLengthISOCountry',
    'date',
  ])
})

describe('fixedLength()', () => {
  it('is a curry-function', () => {
    expect(fixedLength).toBeInstanceOf(Function)
    expect(fixedLength()).toBeInstanceOf(Function)
  })
  it('throws when barcode is omitted', () => {
    expect(() => {
      fixedLength(1337)()
    }).toThrow()
  })
  it('returns object with expected props', () => {
    const parser = fixedLength(5)
    const returnedObj = parser({ barcode: '1234567890' })
    expect(returnedObj).toContainKeys([
      'value',
      'raw',
    ])
  })
  it('reads a fixed length of the barcode', () => {
    const parser = fixedLength(5)
    const { value } = parser({ barcode: '1234567890' })
    expect(value).toBe('12345')
  })
  it('accepts an additional FNC beyond the length', () => {
    const FNC = String.fromCharCode(29)
    const parser = fixedLength(5)
    const { value, raw } = parser({ barcode: `12345${FNC}67890` })
    expect(value).toBe('12345')
    expect(raw).toBe(`12345${FNC}`)
  })
})

describe('variableLength()', () => {
  it('is a curry-function', () => {
    expect(variableLength).toBeInstanceOf(Function)
    expect(variableLength()).toBeInstanceOf(Function)
  })
  it('throws when barcode is omitted', () => {
    expect(() => {
      variableLength()()
    }).toThrow()
  })
  it('returns object with expected props', () => {
    const parser = variableLength()
    const returnedObj = parser({ barcode: `1234567890` })
    expect(returnedObj).toContainKeys([
      'value',
      'raw',
    ])
  })
  it('reads barcode until it encounters an FNC', () => {
    const FNC = String.fromCharCode(29)
    const parser = variableLength()
    const { value, raw } = parser({ barcode: `12345${FNC}67890` })
    expect(value).toBe('12345')
    expect(raw).toBe(`12345${FNC}`)
  })
  it('if no FNC is found, until the limit has been reached', () => {
    const limit = 6
    const parser = variableLength(limit)
    const { value, raw } = parser({ barcode: `1234567890` })
    expect(value).toBe('123456')
    expect(raw).toBe('123456')
  })
  it('if no FNC is found and barcode ends, what has been read is considered enough', () => {
    const limit = 30
    const parser = variableLength(limit)
    const { value, raw } = parser({ barcode: `1234567890` })
    expect(value).toBe('1234567890')
    expect(raw).toBe('1234567890')
  })
})

describe('fixedLengthDecimal()', () => {
  it('is a curry-function', () => {
    expect(fixedLengthDecimal).toBeInstanceOf(Function)
    expect(fixedLengthDecimal()).toBeInstanceOf(Function)
  })
  it('respects the length', () => {
    expect(fixedLengthDecimal(2)({ barcode: '1234567890' }).value).toBe('12')
  })
  it('respects the decimal point', () => {
    expect(fixedLengthDecimal(3, 1)({ barcode: '1234567890' }).value).toBe('12.3')
  })
})

describe('variableLengthDecimal()', () => {
  it('is a curry-function', () => {
    expect(variableLengthDecimal).toBeInstanceOf(Function)
    expect(variableLengthDecimal()).toBeInstanceOf(Function)
  })
  it('respects the maxLength', () => {
    expect(variableLengthDecimal(2)({ barcode: '1234567890' }).value).toBe('12')
  })
  it('respects the decimal point', () => {
    expect(variableLengthDecimal(4, 1)({ barcode: '1234567890' }).value).toBe('123.4')
  })
  it('prioritizes FNC over maxLength', () => {
    const FNC = String.fromCharCode(29)
    expect(variableLengthDecimal(4, 1)({ barcode: `123${FNC}4567890` }).value).toBe('12.3')
  })
})

describe('variableLengthISOCurrency()', () => {
  it('is a curry-function', () => {
    expect(variableLengthISOCurrency).toBeInstanceOf(Function)
    expect(variableLengthISOCurrency()).toBeInstanceOf(Function)
  })
  it('throws when barcode is omitted', () => {
    expect(() => {
      variableLengthISOCurrency()()
    }).toThrow()
  })
  it('returns object with expected props', () => {
    const parser = variableLengthISOCurrency(1)
    const returnedObj = parser({ barcode: `1234567890` })
    expect(returnedObj).toContainKeys([
      'value',
      'amount',
      'isoCurrencyCode',
      'raw',
    ])
  })
  it('uses the first 3 characters as ISO-4217 code', () => {
    const parser = variableLengthISOCurrency()
    const { isoCurrencyCode } = parser({ barcode: `978111111111` })
    expect(isoCurrencyCode).toBe('978') // EUR! :D
  })
  it('includes additional prop for amount', () => {
    const parser = variableLengthISOCurrency()
    const { amount } = parser({ barcode: `9781337` })
    expect(amount).toBe('1337')
  })
  it('respects decimals', () => {
    const parser = variableLengthISOCurrency(7, 2)
    const { amount } = parser({ barcode: `9781337` })
    expect(amount).toBe('13.37')
  })
})

describe('variableLengthISOCountry()', () => {
  it('is a curry-function', () => {
    expect(variableLengthISOCountry).toBeInstanceOf(Function)
    expect(variableLengthISOCountry()).toBeInstanceOf(Function)
  })
  it('throws when barcode is omitted', () => {
    expect(() => {
      variableLengthISOCountry()()
    }).toThrow()
  })
  it('returns object with expected props', () => {
    const parser = variableLengthISOCountry(1)
    const returnedObj = parser({ barcode: `1234567890` })
    expect(returnedObj).toContainKeys([
      'value',
      'isoCountryCode',
      'raw',
    ])
  })
  it('uses the first 3 characters as ISO-3166 code', () => {
    const parser = variableLengthISOCountry()
    const { isoCountryCode } = parser({ barcode: `752` })
    expect(isoCountryCode).toBe('752') // Sweden! :D
  })
  it('respects maxlength (including ISO code)', () => {
    const parser = variableLengthISOCountry(5)
    const { value } = parser({ barcode: `9781337` })
    expect(value).toBe('13')
  })
})

describe('date()', () => {
  it('is a curry-function', () => {
    expect(date).toBeInstanceOf(Function)
    expect(date()).toBeInstanceOf(Function)
  })
  it('uses a fixed length of 6', () => {
    expect(date()({ barcode: '0102030405' }).raw).toBe('010203')
  })
  it('parses as YYMMDD with century-correction', () => {
    expect(date()({ barcode: '990203' }).value).toBe('1999-02-03')
    expect(date()({ barcode: '010203' }).value).toBe('2001-02-03')
  })
})
