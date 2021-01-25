
const {
  fixedLength,
  variableLength,
  variableLengthDecimal,
  fixedLengthDecimal,
  variableLengthISOCurrency,
  variableLengthISOCountry,
  date,
  dateTime,
  dateRange,
} = require('./dataReaders')

const expectedReaders = [
  ['fixedLength', fixedLength],
  ['variableLength', variableLength],
  ['fixedLengthDecimal', fixedLengthDecimal],
  ['variableLengthDecimal', variableLengthDecimal],
  ['variableLengthISOCurrency', variableLengthISOCurrency],
  ['variableLengthISOCountry', variableLengthISOCountry],
  ['date', date],
  ['dateTime', dateTime],
  ['dateRange', dateRange],
]

it('has tests for all exported parsers', () => {
  // A gentle reminder to whomever.
  expect(Object.keys(require('./dataReaders'))).toEqual(expectedReaders.map(([readerName]) => readerName))
})

describe.each(expectedReaders)('%s()', (readerName, readerFn) => {
  it('is a curry-function', () => {
    expect(readerFn).toBeInstanceOf(Function)
    expect(readerFn()).toBeInstanceOf(Function)
  })
})

describe('fixedLength()', () => {
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
  it('respects the length', () => {
    expect(fixedLengthDecimal(2)({ barcode: '1234567890' }).value).toBe('12')
  })
  it('respects the decimal point', () => {
    expect(fixedLengthDecimal(3, 1)({ barcode: '1234567890' }).value).toBe('12.3')
  })
})

describe('variableLengthDecimal()', () => {
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
  it('uses a fixed length of 6', () => {
    expect(date()({ barcode: '0102030405' }).raw).toBe('010203')
  })
  it('returns values in YYYY-MM-DD format', () => {
    expect(date()({ barcode: '010203' }).value).toBe('2001-02-03')
  })
  it('parses as YYMMDD with century-correction', () => {
    expect(date()({ barcode: '990203' }).value).toMatch(/^1999/)
    expect(date()({ barcode: '010203' }).value).toMatch(/^2001/)
  })
})

describe('dateTime()', () => {
  it('uses a fixed length of 10 by default', () => {
    expect(dateTime()({ barcode: '01020304050607' }).raw).toBe('0102030405')
  })
  it('returns values in YYYY-MM-DD HH:mm:ss format', () => {
    expect(dateTime()({ barcode: '9001071337' }).value).toBe('1990-01-07 13:37:00')
  })
  it('parses as YYMMDD with century-correction', () => {
    expect(dateTime()({ barcode: '990203' }).value).toMatch(/^1999/)
    expect(dateTime()({ barcode: '010203' }).value).toMatch(/^2001/)
  })
  describe('dateTime({ optionalMinutesAndSeconds: true })', () => {
    it('uses a fixed length of 12', () => {
      expect(dateTime({ optionalMinutesAndSeconds: true })({ barcode: '01020304050607' }).raw).toBe('010203040506')
    })
    it('allows YYMMDDHHmmss', () => {
      expect(dateTime({ optionalMinutesAndSeconds: true })({ barcode: '900107133755' }).value).toBe('1990-01-07 13:37:55')
    })
    it('allows YYMMDDHHmm', () => {
      // (defaults seconds to 00)
      expect(dateTime({ optionalMinutesAndSeconds: true })({ barcode: '0011222345' }).value).toBe('2000-11-22 23:45:00')
    })
    it('allows YYMMDDHH', () => {
      // (defaults minutes and seconds to 00:00)
      expect(dateTime({ optionalMinutesAndSeconds: true })({ barcode: '00112223' }).value).toBe('2000-11-22 23:00:00')
    })
  })
})

describe('dateRange()', () => {
  it('uses a max length of 12', () => {
    expect(dateRange()({ barcode: '010203040506070809' }).raw).toBe('010203040506')
  })
  it('parses as YYMMDDYYMMDD with century-correction', () => {
    expect(dateRange()({ barcode: '990203010405' }).value).toBe('1999-02-03 - 2001-04-05')
    expect(dateRange()({ barcode: '010203010204' }).value).toBe('2001-02-03 - 2001-02-04')
  })
  it('allows YYMMDD input with FNC to denote a single date', () => {
    const FNC = String.fromCharCode(29)
    expect(dateRange()({ barcode: `010405${FNC}` })).toMatchObject({
      value: '2001-04-05',
      raw: `010405${FNC}`,
    })
  })
})
