
const {
  fixedLength,
  variableLength,
  date,
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
  throw new Error(`Invalid AI at start of barcode: ${barcode}`)
}
/*
    case '3':
      switch (barcode.slice(1, 2)) {
        case '0':
          // Count of Items (Variable Measure Trade Item)
          parseVariableLength('30', 'VAR. COUNT')
          break
        case '1':
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              // Net weight, kilograms (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('310', fourthNumber, 'NET WEIGHT (kg)', 'KGM')
              break
            case '1':
              // Length or first dimension, metres (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('311', fourthNumber, 'LENGTH (m)', 'MTR')
              break
            case '2':
              // Width, diameter, or second dimension, metres (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('312', fourthNumber, 'WIDTH (m)', 'MTR')
              break
            case '3':
              // Depth, thickness, height, or third dimension, metres (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('313', fourthNumber, 'HEIGHT (m)', 'MTR')
              break
            case '4':
              // Area, square metres (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('314', fourthNumber, 'AREA (m^2)', 'MTK')
              break
            case '5':
              // Net volume, litres (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('315', fourthNumber, 'NET VOLUME (l)', 'LTR')
              break
            case '6':
              // Net volume, cubic metres (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('316', fourthNumber, 'NET VOLUME (m^3)', 'MTQ')
              break
            default:
              throw new Error('06')
          }
          break
        case '2':
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              // Net weight, pounds (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('320', fourthNumber, 'NET WEIGHT (lb)', 'LBR')
              break
            case '1':
              // Length or first dimension, inches (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('321', fourthNumber, 'LENGTH (in)', 'INH')
              break
            case '2':
              // Length or first dimension, feet (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('322', fourthNumber, 'LENGTH (ft)', 'FOT')
              break
            case '3':
              // Length or first dimension, yards (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('323', fourthNumber, 'LENGTH (yd)', 'YRD')
              break
            case '4':
              // Width, diameter, or second dimension, inches (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('324', fourthNumber, 'WIDTH (in)', 'INH')
              break
            case '5':
              // Width, diameter, or second dimension, feet (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('325', fourthNumber, 'WIDTH (ft)', 'FOT')
              break
            case '6':
              // Width, diameter, or second dimension, yards (Variable Measure Trade Item
              parsers.fixedLengthMeasure('326', fourthNumber, 'WIDTH (yd)', 'YRD')
              break
            case '7':
              // Depth, thickness, height, or third dimension, inches (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('327', fourthNumber, 'HEIGHT (in)', 'INH')
              break
            case '8':
              // Depth, thickness, height, or third dimension, feet (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('328', fourthNumber, 'HEIGHT (ft)', 'FOT')
              break
            case '9':
              // Depth, thickness, height, or third dimension, yards (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('329', fourthNumber, 'HEIGHT (yd)', 'YRD')
              break
            default:
              throw new Error('07')
          }
          break
        case '3':
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              // Logistic weight, kilograms
              parsers.fixedLengthMeasure('330', fourthNumber, 'GROSS WEIGHT (kg)', 'KGM')
              break
            case '1':
              // Length or first dimension, metres
              parsers.fixedLengthMeasure('331', fourthNumber, 'LENGTH (m), log', 'MTR')
              break
            case '2':
              // Width, diameter, or second dimension, metres
              parsers.fixedLengthMeasure('332', fourthNumber, 'WIDTH (m), log', 'MTR')
              break
            case '3':
              // Depth, thickness, height, or third dimension, metres
              parsers.fixedLengthMeasure('333', fourthNumber, 'HEIGHT (m), log', 'MTR')
              break
            case '4':
              // Area, square metres
              parsers.fixedLengthMeasure('334', fourthNumber, 'AREA (m^2), log', 'MTK')
              break
            case '5':
              // Logistic volume, litres
              parsers.fixedLengthMeasure('335', fourthNumber, 'VOLUME (l), log', 'LTR')
              break
            case '6':
              // Logistic volume, cubic metres
              parsers.fixedLengthMeasure('336', fourthNumber, 'VOLUME (m^3), log', 'MTQ')
              break
            case '7':
              // Kilograms per square metre, yes, the ISO code for this _is_ "28".
              parsers.fixedLengthMeasure('337', fourthNumber, 'KG PER m²', '28')
              break
            default:
              throw new Error('08')
          }
          break
        case '4':
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              // Logistic weight, pounds
              parsers.fixedLengthMeasure('340', fourthNumber, 'GROSS WEIGHT (lb)', 'LBR')
              break
            case '1':
              // Length or first dimension, inches
              parsers.fixedLengthMeasure('341', fourthNumber, 'LENGTH (in), log', 'INH')
              break
            case '2':
              // Length or first dimension, feet
              parsers.fixedLengthMeasure('342', fourthNumber, 'LENGTH (ft), log', 'FOT')
              break
            case '3':
              // Length or first dimension, yards
              parsers.fixedLengthMeasure('343', fourthNumber, 'LENGTH (yd), log', 'YRD')
              break
            case '4':
              // Width, diameter, or second dimension, inches
              parsers.fixedLengthMeasure('344', fourthNumber, 'WIDTH (in), log', 'INH')
              break
            case '5':
              // Width, diameter, or second dimension, feet
              parsers.fixedLengthMeasure('345', fourthNumber, 'WIDTH (ft), log', 'FOT')
              break
            case '6':
              // Width, diameter, or second dimension, yard
              parsers.fixedLengthMeasure('346', fourthNumber, 'WIDTH (yd), log', 'YRD')
              break
            case '7':
              // Depth, thickness, height, or third dimension, inches
              parsers.fixedLengthMeasure('347', fourthNumber, 'HEIGHT (in), log', 'INH')
              break
            case '8':
              // Depth, thickness, height, or third dimension, feet
              parsers.fixedLengthMeasure('348', fourthNumber, 'HEIGHT (ft), log', 'FOT')
              break
            case '9':
              // Depth, thickness, height, or third dimension, yards
              parsers.fixedLengthMeasure('349', fourthNumber, 'HEIGHT (yd), log', 'YRD')
              break
            default:
              throw new Error('09')
          }
          break
        case '5':
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              // Area, square inches (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('350', fourthNumber, 'AREA (i2)', 'INK')
              break
            case '1':
              // Area, square feet (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('351', fourthNumber, 'AREA (f2)', 'FTK')
              break
            case '2':
              // Area, square yards (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('352', fourthNumber, 'AREA (y2)', 'YDK')
              break
            case '3':
              // Area, square inches
              parsers.fixedLengthMeasure('353', fourthNumber, 'AREA (i2), log', 'INK')
              break
            case '4':
              // Area, square feet
              parsers.fixedLengthMeasure('354', fourthNumber, 'AREA (f2), log', 'FTK')
              break
            case '5':
              // Area, square yards
              parsers.fixedLengthMeasure('355', fourthNumber, 'AREA (y2), log', 'YDK')
              break
            case '6':
              // Net weight, troy ounces (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('356', fourthNumber, 'NET WEIGHT (t oz)', 'APZ')
              break
            case '7':
              // Net weight (or volume), ounces (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('357', fourthNumber, 'NET VOLUME (oz)', 'ONZ')
              break
            default:
              throw new Error('10')
          }
          break
        case '6':
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              // Net volume, quarts (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('360', fourthNumber, 'NET VOLUME (qt)', 'QT')
              break
            case '1':
              // Net volume, gallons U.S. (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('361', fourthNumber, 'NET VOLUME (gal)', 'GLL')
              break
            case '2':
              // Logistic volume, quarts
              parsers.fixedLengthMeasure('362', fourthNumber, 'VOLUME (qt), log', 'QT')
              break
            case '3':
              // Logistic volume, gallons U.S.
              parsers.fixedLengthMeasure('363', fourthNumber, 'VOLUME (gal), log', 'GLL')
              break
            case '4':
              // Net volume, cubic inches (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('364', fourthNumber, 'VOLUME (i3)', 'INQ')
              break
            case '5':
              // Net volume, cubic feet (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('365', fourthNumber, 'VOLUME (f3)', 'FTQ')
              break
            case '6':
              // Net volume, cubic yards (Variable Measure Trade Item)
              parsers.fixedLengthMeasure('366', fourthNumber, 'VOLUME (y3)', 'YDQ')
              break
            case '7':
              // Logistic volume, cubic inches
              parsers.fixedLengthMeasure('367', fourthNumber, 'VOLUME (i3), log', 'INQ')
              break
            case '8':
              // Logistic volume, cubic feet
              parsers.fixedLengthMeasure('368', fourthNumber, 'VOLUME (f3), log', 'FTQ')
              break
            case '9':
              // Logistic volume, cubic yards
              parsers.fixedLengthMeasure('369', fourthNumber, 'VOLUME (y3), log', 'YDQ')
              break
            default:
              throw new Error('11')
          }
          break
        case '7':
          // Count of Trade Items
          parseVariableLength('37', 'COUNT')
          break
          // AI "38" isn't defined
        case '9':
          // third and fourth numbers matter:
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              // Applicable Amount Payable, local currency
              parseVariableLengthMeasure('390', fourthNumber, 'AMOUNT', '')
              break
            case '1':
              // Applicable Amount Payable with ISO Currency Code
              parseVariableLengthWithISONumbers('391', fourthNumber, 'AMOUNT')
              break
            case '2':
              // Applicable Amount Payable, single monetary area (Variable Measure Trade Item)
              parseVariableLengthMeasure('392', fourthNumber, 'PRICE', '')
              break
            case '3':
              // Applicable Amount Payable with ISO Currency Code (Variable Measure Trade Item)
              parseVariableLengthWithISONumbers('393', fourthNumber, 'PRICE')
              break
            default:
              throw new Error('12')
          }
          break
        default:
          throw new Error('13')
      }
      break
    case '4':
      switch (barcode.slice(1, 2)) {
        case '0':
          // third number matters:
          thirdNumber = codestring.slice(2, 3)
          switch (thirdNumber) {
            case '0':
              // Customer's Purchase Order Number
              parseVariableLength('400', 'ORDER NUMBER')
              break
            case '1':
              // Global Identification Number for Consignment (GINC)
              parseVariableLength('401', 'GINC')
              break
            case '2':
              // Global Shipment Identification Number (GSIN)
              parseVariableLength('402', 'GSIN') // should be 17 digits long
              break
            case '3':
              // Routing Code
              parseVariableLength('403', 'ROUTE')
              break
            default:
              throw new Error('14')
          }
          break
        case '1':
          // third number matters:
          thirdNumber = codestring.slice(2, 3)
          switch (thirdNumber) {
            case '0':
              // Ship to - Deliver to Global Location Number
              parsers.fixedLength('410', 'SHIP TO LOC', 13)
              break
            case '1':
              // Bill to - Invoice to Global Location Number
              parsers.fixedLength('411', 'BILL TO', 13)
              break
            case '2':
              // Purchased from Global Location Number
              parsers.fixedLength('412', 'PURCHASE FROM', 13)
              break
            case '3':
              // Ship for - Deliver for - Forward to Global Location Number
              parsers.fixedLength('413', 'SHIP FOR LOC', 13)
              break
            default:
              throw new Error('15')
          }
          break
        case '2':
          // third number matters:
          thirdNumber = codestring.slice(2, 3)
          switch (thirdNumber) {
            case '0':
              // Ship to - Deliver to Postal Code Within a Single Postal Authority
              parseVariableLength('420', 'SHIP TO POST')
              break
            case '1':
              // Ship to - Deliver to Postal Code with ISO Country Code
              parseVariableLengthWithISOChars('421', 'SHIP TO POST')
              break
            case '2':
              // Country of Origin of a Trade Item
              parsers.fixedLength('422', 'ORIGIN', 3)
              break
            case '3':
              // Country of Initial Processing
              // Up to 5 3-digit ISO-countrycodes
              parseVariableLength('423', 'COUNTRY - INITIAL PROCESS.')
              break
            case '4':
              // Country of Processing
              parsers.fixedLength('424', 'COUNTRY - PROCESS.', 3)
              break
            case '5':
              // Country of Disassembly
              parsers.fixedLength('425', 'COUNTRY - DISASSEMBLY', 3)
              break
            case '6':
              // Country Covering full Process Chain
              parsers.fixedLength('426', 'COUNTRY – FULL PROCESS', 3)
              break
            case '7':
              // Country Subdivision of Origin
              parseVariableLength('427', 'ORIGIN SUBDIVISION')
              break
            default:
              throw new Error('16')
          }
          break
        default:
          throw new Error('17')
      }
      break
      // first digits 5 and 6 are not used
    case '7':
      switch (barcode.slice(1, 2)) {
        case '0':
          // third and fourth number matter:
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              switch (fourthNumber) {
                case '1':
                  // NATO Stock Number (NSN)
                  parseVariableLength('7001', 'NSN') // should be 13 digits long
                  break
                case '2':
                  // UN/ECE Meat Carcasses and Cuts Classification
                  parseVariableLength('7002', 'MEAT CUT')
                  break
                case '3':
                  // Expiration Date and Time
                  parseVariableLength('7003', 'EXPIRY TIME') // should be 10 digits long
                  break
                case '4':
                  // Active Potency
                  parseVariableLength('7004', 'ACTIVE POTENCY')
                  break
                default:
                  throw new Error('18')
              }
              break
              // 1 and 2 are not used
            case '3':
              // Approval Number of Processor with ISO Country Code

              // Title and stem for parsing are build from 4th number:

              parseVariableLengthWithISOChars('703' + fourthNumber, 'PROCESSOR # ' + fourthNumber)
              break
            default:
              throw new Error('19')
          }
          break
        case '1':
          thirdNumber = codestring.slice(2, 3)
          switch (thirdNumber) {
            case '0':
              // National Healthcare Reimbursement Number (NHRN) – Germany PZN
              parseVariableLength('710', 'NHRN PZN')
              break
            case '1':
              // National Healthcare Reimbursement Number (NHRN) – France CIP
              parseVariableLength('711', 'NHRN CIP')
              break
            case '2':
              // National Healthcare Reimbursement Number (NHRN) – Spain CN
              parseVariableLength('712', 'NHRN CN')
              break
            case '3':
              // National Healthcare Reimbursement Number (NHRN) – Brasil DRN
              parseVariableLength('713', 'NHRN DRN')
              break
            default:
              throw new Error('20')
          }
          break
        default:
          throw new Error('21')
      }
      break
    case '8':
      switch (barcode.slice(1, 2)) {
        case '0':
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)

          switch (thirdNumber) {
            case '0':
              switch (fourthNumber) {
                case '1':
                  // Roll Products (Width, Length, Core Diameter, Direction, Splices)
                  parseVariableLength('8001', 'DIMENSIONS') // should be 14 digits long
                  break
                case '2':
                  // Cellular Mobile Telephone Identifier
                  parseVariableLength('8002', 'CMT No')
                  break
                case '3':
                  // Global Returnable Asset Identifier (GRAI)
                  parseVariableLength('8003', 'GRAI') // should contain at least 14 digits
                  break
                case '4':
                  // Global Individual Asset Identifier (GIAI)
                  parseVariableLength('8004', 'GIAI')
                  break
                case '5':
                  // Price Per Unit of Measure
                  parseVariableLength('8005', 'PRICE PER UNIT') // should be 6 digits long
                  break
                case '6':
                  // Identification of the Components of a Trade Item
                  parseVariableLength('8006', 'GCTIN') // should be exactly 18 digits long
                  break
                case '7':
                  // International Bank Account Number (IBAN)
                  parseVariableLength('8007', 'IBAN')
                  break
                case '8':
                  // Date and Time of Production
                  parseVariableLength('8008', 'PROD TIME') // should be exactly 12 digits long
                  break
                default:
                  throw new Error('22')
              }
              break
            case '1':
              switch (fourthNumber) {
                case '0':
                  // Component / Part Identifier (CPID)
                  parseVariableLength('8010', 'CPID')
                  break
                case '1':
                  // Component / Part Identifier Serial Number (CPID SERIAL)
                  parseVariableLength('8011', 'CPID SERIAL')
                  break
                case '7':
                  // Global Service Relation Number to identify the relationship between an organisation offering services and the provider of services
                  parseVariableLength('8017', 'GSRN - PROVIDER') // should be 18 digits long
                  break
                case '8':
                  // Global Service Relation Number to identify the relationship between an organisation offering services and the recipient of services
                  parseVariableLength('8018', 'GSRN - RECIPIENT') // should be 18 digits long
                  break
                case '9':
                  // Service Relation Instance Number (SRIN)
                  parseVariableLength('8019', 'SRIN')
                  break
                default:
                  throw new Error('23')
              }
              break
            case '2':
              switch (fourthNumber) {
                case '0':
                  // Payment Slip Reference Number
                  parseVariableLength('8020', 'REF No')
                  break
                default:
                  throw new Error('24')
              }
              break
            default:
              throw new Error('25')
          }
          break
        case '1':
          thirdNumber = codestring.slice(2, 3)
          fourthNumber = codestring.slice(3, 4)
          switch (thirdNumber) {
            case '0':
              switch (fourthNumber) {
                case '0':
                  // GS1-128 Coupon Extended Code
                  parseVariableLength('8100', '-') // should be 6 digits long
                  break
                case '1':
                  // GS1-128 Coupon Extended Code
                  parseVariableLength('8101', '-') // should be 10 digits long
                  break
                case '2':
                  // GS1-128 Coupon Extended Code
                  parseVariableLength('8102', '-') // should be 2 digits long
                  break
                default:
                  throw new Error('26')
              }
              break
            case '1':
              switch (fourthNumber) {
                case '0':
                  // Coupon Code Identification for Use in North America
                  parseVariableLength('8110', '-')
                  break
                default:
                  throw new Error('27')
              }
              break
            default:
              throw new Error('28')
          }
          break
        case '2':
          thirdNumber = codestring.slice(2, 3)
          switch (thirdNumber) {
            case '0':
              // Extended Packaging URL
              parseVariableLength('8200', 'PRODUCT URL')
              break
            default:
              throw new Error('29')
          }
          break
        default:
          throw new Error('30')
      }
      break
    case '9':
      switch (barcode.slice(1, 2)) {
        case '0':
          // Information Mutually Agreed Between Trading Partners
          parseVariableLength('90', 'INTERNAL')
          break
        case '1':
          // Company Internal Information
          parseVariableLength('91', 'INTERNAL')
          break
        case '2':
          // Company Internal Information
          parseVariableLength('92', 'INTERNAL')
          break
        case '3':
          // Company Internal Information
          parseVariableLength('93', 'INTERNAL')
          break
        case '4':
          // Company Internal Information
          parseVariableLength('94', 'INTERNAL')
          break
        case '5':
          // Company Internal Information
          parseVariableLength('95', 'INTERNAL')
          break
        case '6':
          // Company Internal Information
          parseVariableLength('96', 'INTERNAL')
          break
        case '7':
          // Company Internal Information
          parseVariableLength('97', 'INTERNAL')
          break
        case '8':
          // Company Internal Information
          parseVariableLength('98', 'INTERNAL')
          break
        case '9':
          // Company Internal Information
          parseVariableLength('99', 'INTERNAL')
          break
        default:
          throw new Error('31')
      }
      break
    default:
      throw new Error('32')
  }
}/**/
