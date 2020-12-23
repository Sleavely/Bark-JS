
const {
  fixedLength,
  variableLength,
  date,
  dateTime,
  dateRange,
  fixedLengthDecimal,
  variableLengthDecimal,
  variableLengthISOCurrency,
  variableLengthISOCountry,
} = require('./dataReaders')

exports.parseAi = (barcode) => {
  switch (barcode.slice(0, 1)) {
    case '0':
      switch (barcode.slice(1, 2)) {
        case '0':
          // SSCC (Serial Shipping Container Code)
          return { ai: '00', title: 'SSCC', parser: fixedLength(18) }
        case '1':
          // Global Trade Item Number (GTIN)
          return { ai: '01', title: 'GTIN', parser: fixedLength(14) }
        case '2':
          // GTIN of Contained Trade Items
          return { ai: '02', title: 'CONTENT', parser: fixedLength(14) }
      }
      break
    case '1':
      switch (barcode.slice(1, 2)) {
        case '0':
          return { ai: '10', title: 'BATCH/LOT', parser: variableLength(20) }
        case '1':
          return { ai: '11', title: 'PROD DATE', parser: date() }
        case '2':
          return { ai: '12', title: 'DUE DATE', parser: date() }
        case '3':
          return { ai: '13', title: 'PACK DATE', parser: date() }
        case '4':
          break
        case '5':
          return { ai: '15', title: 'BEST BEFORE or BEST BY', parser: date() }
        case '6':
          return { ai: '16', title: 'SELL BY', parser: date() }
        case '7':
          return { ai: '17', title: 'USE BY OR EXPIRY', parser: date() }
      }
      break
    case '2':
      switch (barcode.slice(1, 2)) {
        case '0':
          return { ai: '20', title: 'VARIANT', parser: fixedLength(2) }
        case '1':
          return { ai: '21', title: 'SERIAL', parser: variableLength(20) }
        case '2':
          return { ai: '22', title: 'CPV', parser: variableLength(20) }
        case '3':
          switch (barcode.slice(2, 3)) {
            case '5':
              return { ai: '235', title: 'TPX', parser: variableLength(28) }
          }
          break
        case '4':
          switch (barcode.slice(2, 3)) {
            case '0':
              return { ai: '240', title: 'ADDITIONAL ID', parser: variableLength(30) }
            case '1':
              return { ai: '241', title: 'CUST. PART NO.', parser: variableLength(30) }
            case '2':
              return { ai: '242', title: 'MTO VARIANT', parser: variableLength(6) }
            case '3':
              return { ai: '243', title: 'PCN', parser: variableLength(20) }
          }
          break
        case '5':
          switch (barcode.slice(2, 3)) {
            case '0':
              return { ai: '250', title: 'SECONDARYSERIAL', parser: variableLength(30) }
            case '1':
              return { ai: '251', title: 'REF. TO SOURCE', parser: variableLength(30) }
            case '2':
              break
            case '3':
              return { ai: '253', title: 'GDTI', parser: variableLength(30) }
            case '4':
              return { ai: '254', title: 'GLN EXTENSION COMPONENT', parser: variableLength(20) }
            case '5':
              return { ai: '255', title: 'GCN', parser: variableLength(25) }
          }
          break
      }
      break
    case '3':
      switch (barcode.slice(1, 2)) {
        case '0':
          return { ai: '30', title: 'VAR. COUNT', parser: variableLength(8) }
        case '1': {
          const decIndicator = barcode.slice(3, 4)
          // Decimal point offset cant be higher than the values lengths
          if (parseInt(decIndicator, 10) > 6) break
          switch (barcode.slice(2, 3)) {
            case '0':
              return { ai: `310${decIndicator}`, title: 'NET WEIGHT (kg)', parser: fixedLengthDecimal(6, decIndicator) }
            case '1':
              return { ai: `311${decIndicator}`, title: 'LENGTH (m)', parser: fixedLengthDecimal(6, decIndicator) }
            case '2':
              return { ai: `312${decIndicator}`, title: 'WIDTH (m)', parser: fixedLengthDecimal(6, decIndicator) }
            case '3':
              return { ai: `313${decIndicator}`, title: 'HEIGHT (m)', parser: fixedLengthDecimal(6, decIndicator) }
            case '4':
              return { ai: `314${decIndicator}`, title: 'AREA (m^2)', parser: fixedLengthDecimal(6, decIndicator) }
            case '5':
              return { ai: `315${decIndicator}`, title: 'NET VOLUME (l)', parser: fixedLengthDecimal(6, decIndicator) }
            case '6':
              return { ai: `316${decIndicator}`, title: 'NET VOLUME (m^3)', parser: fixedLengthDecimal(6, decIndicator) }
          }
          break
        }
        case '2': { // 32nn
          const titles = [
            'NET WEIGHT (lb)',
            'LENGTH (in)',
            'LENGTH (ft)',
            'LENGTH (yd)',
            'WIDTH (in)',
            'WIDTH (ft)',
            'WIDTH (yd)',
            'HEIGHT (in)',
            'HEIGHT (ft)',
            'HEIGHT (yd)',
          ]
          const titleIndicator = parseInt(barcode.slice(2, 3), 10)
          const title = titles[titleIndicator]
          if (!title) break

          const valueLength = 6
          const decIndicator = parseInt(barcode.slice(3, 4), 10)
          if (decIndicator > valueLength) break

          return { ai: `${barcode.slice(0, 4)}`, title, parser: fixedLengthDecimal(valueLength, decIndicator) }
        }
        case '3': { // 33nn
          const titles = [
            'GROSS WEIGHT (kg)',
            'LENGTH (m), log',
            'WIDTH (m), log',
            'HEIGHT (m), log',
            'AREA (m^2), log',
            'VOLUME (l), log',
            'VOLUME (m^3), log',
            'KG PER m^2',
          ]
          const titleIndicator = parseInt(barcode.slice(2, 3), 10)
          const title = titles[titleIndicator]
          if (!title) break

          const valueLength = 6
          const decIndicator = parseInt(barcode.slice(3, 4), 10)
          if (decIndicator > valueLength) break

          return { ai: `${barcode.slice(0, 4)}`, title, parser: fixedLengthDecimal(valueLength, decIndicator) }
        }
        case '4': { // 34nn
          const titles = [
            'GROSS WEIGHT (lb)',
            'LENGTH (in), log',
            'LENGTH (ft), log',
            'LENGTH (yd), log',
            'WIDTH (in), log',
            'WIDTH (ft), log',
            'WIDTH (yd), log',
            'HEIGHT (in), log',
            'HEIGHT (ft), log',
            'HEIGHT (yd), log',
          ]
          const titleIndicator = parseInt(barcode.slice(2, 3), 10)
          const title = titles[titleIndicator]
          if (!title) break

          const valueLength = 6
          const decIndicator = parseInt(barcode.slice(3, 4), 10)
          if (decIndicator > valueLength) break

          return { ai: `${barcode.slice(0, 4)}`, title, parser: fixedLengthDecimal(valueLength, decIndicator) }
        }
        case '5': { // 35nn
          const titles = [
            'AREA (in^2)',
            'AREA (ft^2)',
            'AREA (yd^2)',
            'AREA (in^2), log',
            'AREA (ft^2), log',
            'AREA (yd^2), log',
            'NET WEIGHT (t oz)',
            'NET VOLUME (oz)',
          ]
          const titleIndicator = parseInt(barcode.slice(2, 3), 10)
          const title = titles[titleIndicator]
          if (!title) break

          const valueLength = 6
          const decIndicator = parseInt(barcode.slice(3, 4), 10)
          if (decIndicator > valueLength) break

          return { ai: `${barcode.slice(0, 4)}`, title, parser: fixedLengthDecimal(valueLength, decIndicator) }
        }
        case '6': { // 36nn
          const titles = [
            'NET VOLUME (qt)',
            'NET VOLUME (gal)',
            'VOLUME (qt), log',
            'VOLUME (gal), log',
            'VOLUME (in^3)',
            'VOLUME (ft^3)',
            'VOLUME (yd^3)',
            'VOLUME (in^3), log',
            'VOLUME (ft^3), log',
            'VOLUME (yd^3), log',
          ]
          const titleIndicator = parseInt(barcode.slice(2, 3), 10)
          const title = titles[titleIndicator]
          if (!title) break

          const valueLength = 6
          const decIndicator = parseInt(barcode.slice(3, 4), 10)
          if (decIndicator > valueLength) break

          return { ai: `${barcode.slice(0, 4)}`, title, parser: fixedLengthDecimal(valueLength, decIndicator) }
        }
        case '7':
          return { ai: `37`, title: 'COUNT', parser: variableLength(8) }
        case '9':
          const decIndicator = parseInt(barcode.slice(3, 4), 10)
          switch (barcode.slice(2, 3)) {
            case '0':
              return { ai: `390${decIndicator}`, title: 'AMOUNT', parser: variableLengthDecimal(15, decIndicator) }
            case '1':
              return { ai: `391${decIndicator}`, title: 'AMOUNT', parser: variableLengthISOCurrency(18, decIndicator) }
            case '2':
              return { ai: `392${decIndicator}`, title: 'PRICE', parser: variableLengthDecimal(15, decIndicator) }
            case '3':
              return { ai: `393${decIndicator}`, title: 'PRICE', parser: variableLengthISOCurrency(18, decIndicator) }
            case '4':
              if (decIndicator > 4) break
              return { ai: `394${decIndicator}`, title: 'PRCNT OFF', parser: fixedLengthDecimal(4, decIndicator) }
          }
          break
      }
      break
    case '4':
      switch (barcode.slice(1, 3)) {
        case '00':
          return { ai: '400', title: 'ORDER NUMBER', parser: variableLength(30) }
        case '01':
          return { ai: '401', title: 'GINC', parser: variableLength(30) }
        case '02':
          return { ai: '402', title: 'GSIN', parser: variableLength(17) }
        case '03':
          return { ai: '403', title: 'ROUTE', parser: variableLength(30) }
        case '10':
          return { ai: '410', title: 'SHIP TO LOC', parser: fixedLength(13) }
        case '11':
          return { ai: '411', title: 'BILL TO', parser: fixedLength(13) }
        case '12':
          return { ai: '412', title: 'PURCHASE FROM', parser: fixedLength(13) }
        case '13':
          return { ai: '413', title: 'SHIP FOR LOC', parser: fixedLength(13) }
        case '14':
          return { ai: '414', title: 'LOC No', parser: fixedLength(13) }
        case '15':
          return { ai: '415', title: 'PAY TO', parser: fixedLength(13) }
        case '16':
          return { ai: '416', title: 'PROD/SERV LOC', parser: fixedLength(13) }
        case '17':
          return { ai: '417', title: 'PARTY', parser: fixedLength(13) }
        case '20':
          return { ai: '420', title: 'SHIP TO POST', parser: variableLength(20) }
        case '21':
          return { ai: '421', title: 'SHIP TO POST', parser: variableLengthISOCountry(20) }
        case '22':
          return { ai: '422', title: 'ORIGIN', parser: fixedLength(3) }
        case '23':
          return { ai: '423', title: 'COUNTRY - INITIAL PROCESS.', parser: variableLength(15) }
        case '24':
          return { ai: '424', title: 'COUNTRY - PROCESS.', parser: fixedLength(3) }
        case '25':
          return { ai: '425', title: 'COUNTRY - DISASSEMBLY', parser: variableLength(15) }
        case '26':
          return { ai: '426', title: 'COUNTRY - FULL PROCESS', parser: fixedLength(3) }
        case '27':
          return { ai: '427', title: 'ORIGIN SUBDIVISION', parser: variableLength(3) }
      }
      break
    case '7':
      switch (barcode.slice(1, 3)) {
        case '00':
          switch (barcode.slice(3, 4)) {
            case '1':
              return { ai: '7001', title: 'NSN', parser: fixedLength(13) }
            case '2':
              return { ai: '7002', title: 'MEAT CUT', parser: variableLength(30) }
            case '3':
              return { ai: '7003', title: 'EXPIRY TIME', parser: dateTime() }
            case '4':
              return { ai: '7004', title: 'ACTIVE POTENCY', parser: variableLength(4) }
            case '5':
              return { ai: '7005', title: 'CATCH AREA', parser: variableLength(12) }
            case '6':
              return { ai: '7006', title: 'FIRST FREEZE DATE', parser: date() }
            case '7':
              return { ai: '7007', title: 'HARVEST DATE', parser: dateRange() }
            case '8':
              return { ai: '7008', title: 'AQUATIC SPECIES', parser: variableLength(3) }
            case '9':
              return { ai: '7009', title: 'FISHING GEAR TYPE', parser: variableLength(10) }
          }
          break
        case '01':
          return { ai: '7010',
            title: 'PROD METHOD',
            parser: (opts) => (output => {
              const humanMapping = {
                '01': 'Caught at Sea',
                '02': 'Caught in Fresh Water',
                '03': 'Farmed',
                '04': 'Cultivated',
              }
              return { ...output, human: humanMapping[output.value] }
            })(variableLength(2)(opts)) }

        case '02':
          switch (barcode.slice(3, 4)) {
            case '0':
              return { ai: '7020', title: 'REFURB LOT', parser: variableLength(20) }
            case '1':
              return { ai: '7021', title: 'FUNC STAT', parser: variableLength(20) }
            case '2':
              return { ai: '7022', title: 'REV STAT', parser: variableLength(20) }
            case '3':
              return { ai: '7023', title: 'GIAI - ASSEMBLY', parser: variableLength(30) }
          }
          break

        case '03':
          const processor = barcode.slice(3, 4)
          return { ai: barcode.slice(0, 4), title: `PROCESSOR # ${processor}`, parser: variableLengthISOCountry(33) }

        case '04':
          switch (barcode.slice(3, 4)) {
            case '0':
              return { ai: '7040', title: 'UIC+EXT', parser: variableLength(4) }
          }
          break

        case '10':
          return { ai: '710', title: 'NHRN PZN', parser: variableLength(20) }
        case '11':
          return { ai: '711', title: 'NHRN CIP', parser: variableLength(20) }
        case '12':
          return { ai: '712', title: 'NHRN CN', parser: variableLength(20) }
        case '13':
          return { ai: '713', title: 'NHRN DRN', parser: variableLength(20) }
        case '14':
          return { ai: '714', title: 'NHRN AIM', parser: variableLength(20) }

        case '23':
          const certReference = barcode.slice(3, 4)
          return { ai: barcode.slice(0, 4), title: `CERT # ${certReference}`, parser: variableLength(30) }

        case '24':
          switch (barcode.slice(3, 4)) {
            case '0':
              return { ai: '7240', title: 'PROTOCOL', parser: variableLength(20) }
          }
          break
      }
      break
    case '8':
      switch (barcode.slice(1, 4)) {
        case '200':
          return { ai: '8200', title: 'PRODUCT URL', parser: variableLength(70) }
      }
      break
    case '9':
      switch (barcode.slice(1, 2)) {
        case '0':
          return { ai: '90', title: 'INTERNAL', parser: variableLength(30) }
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          return { ai: barcode.slice(0, 2), title: 'INTERNAL', parser: variableLength(90) }
      }
      break
  }
  throw new Error(`Invalid AI at start of barcode section: ${barcode}. This likely occurred because your barcode has a value that is longer than the permitted max length for a particular AI.`)
}
