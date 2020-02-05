
const injectDecimal = require('./utils/injectDecimal')

exports.fixedLength = (length) => ({
  barcode,
  fnc = String.fromCharCode(29),
}) => {
  const value = barcode.slice(0, length)

  return {
    value,
    raw: (
      // Take superfluous FNC into consideration
      barcode.slice(value.length).startsWith(fnc)
        ? [value, fnc].join('')
        : value
    ),
  }
}

exports.variableLength = (maxLength) => ({
  barcode,
  fnc = String.fromCharCode(29),
}) => {
  const characters = []

  for (const character of barcode) {
    if (character === fnc || characters.length === maxLength) break
    characters.push(character)
  }

  const value = characters.join('')
  // We may have reached end of code without finding FNC1,
  // but that may be okay too so lets return the whole thing as-is.
  return {
    value,
    raw: (
      barcode.slice(value.length).startsWith(fnc)
        ? [value, fnc].join('')
        : value
    ),
  }
}

exports.fixedLengthDecimal = (length, decimalPositionFromEnd) => ({
  barcode,
  fnc = String.fromCharCode(29),
}) => {
  const { value: originalValue, raw } = exports.fixedLength(length)({ barcode, fnc })
  const value = injectDecimal(originalValue, decimalPositionFromEnd)
  return {
    value,
    raw,
  }
}

exports.variableLengthDecimal = (maxLength, decimalPositionFromEnd) => ({
  barcode,
  fnc = String.fromCharCode(29),
}) => {
  const { value: originalValue, raw } = exports.variableLength(maxLength)({ barcode, fnc })
  const value = injectDecimal(originalValue, decimalPositionFromEnd)

  return {
    value,
    raw,
  }
}

/**
 * Parses codes where the first three digits represent an ISO 4217 currency.
 */
exports.variableLengthISOCurrency = (maxLength, decimalPositionFromEnd) => ({
  barcode,
  fnc = String.fromCharCode(29),
}) => {
  const isoCurrencyCode = barcode.slice(0, 3)
  const { value: amount, raw } = exports.variableLengthDecimal(maxLength - 3, decimalPositionFromEnd)({
    barcode: barcode.slice(3),
    fnc,
  })

  return {
    value: `${isoCurrencyCode}${amount}`,
    isoCurrencyCode,
    amount,
    raw: `${isoCurrencyCode}${raw}`,
  }
}

/**
 * Parses codes where the first three digits represent an ISO 3166 country code.
 */
exports.variableLengthISOCountry = (maxLength) => ({
  barcode,
  fnc = String.fromCharCode(29),
}) => {
  const isoCountryCode = barcode.slice(0, 3)
  const { value, raw } = exports.variableLength(maxLength - 3)({
    barcode: barcode.slice(3),
    fnc,
  })

  return {
    value,
    isoCountryCode,
    raw: `${isoCountryCode}${raw}`,
  }
}

/**
 * Parses YYMMDD
 */
exports.date = () => ({
  barcode,
  fnc = String.fromCharCode(29),
}) => {
  const { value: yymmdd, raw } = exports.fixedLength(6)({ barcode, fnc })

  const year = parseInt(yymmdd.slice(0, 2), 10)
  const month = yymmdd.slice(2, 4)
  const day = yymmdd.slice(4, 6)

  // section 7.12 of the specification states that
  // years 51-99 should be considered to belong to the 1900s
  const century = (year > 50 ? 1900 : 2000)

  const value = `${year + century}-${month}-${day}`
  return {
    value,
    raw,
  }
}

/**
 * Parses YYMMDDYYMMDD (Start-End) and YYMMDD (Start and End on same date)
 */
exports.dateRange = () => ({
  barcode,
  fnc = String.fromCharCode(29),
}) => {
  const varLength = exports.variableLength(12)({ barcode, fnc })
  const hasTwoDates = varLength.value.length > 6
  const firstDate = exports.date()({ barcode: barcode.slice(0, 6), fnc })
  const secondDate = exports.date()({ barcode: barcode.slice(6), fnc })

  // "In case the period spans one calendar day, the end date SHALL NOT be specified." - section 3.8.8
  const value = `${firstDate.value}${hasTwoDates ? ' - ' + secondDate.value : ''}`
  return {
    value,
    raw: varLength.raw,
  }
}
