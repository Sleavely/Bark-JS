
module.exports = exports = (input, decimalPositionFromEnd) => {
  const str = `${input}`
  const decPos = parseInt(decimalPositionFromEnd, 10)
  const injectedDecimal = (
    decPos
      ? `${str.slice(0, -decPos)}.${str.slice(-decPos)}`
      : `${str}`
  )
  return (
    injectedDecimal.startsWith('.')
      ? `0${injectedDecimal}`
      : injectedDecimal
  )
}
