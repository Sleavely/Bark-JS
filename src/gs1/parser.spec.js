
const parser = require('./parser')

describe('unit', () => {
  it('figures out GTIN', () => {
    expect(parser({ barcode: '0112345678901234' })).toMatchObject({
      symbology: 'unknown',
      elements: [
        {
          ai: '01',
          raw: '12345678901234',
          title: 'GTIN',
          value: '12345678901234',
        },
      ],
      originalBarcode: '0112345678901234',
    })
  })

  it('figures out GTIN with a QR symbology prefix', () => {
    expect(parser({ barcode: ']Q30112345678901234' })).toMatchObject({
      symbology: 'GS1 QR Code',
      elements: [
        {
          ai: '01',
          raw: '12345678901234',
          title: 'GTIN',
          value: '12345678901234',
        },
      ],
      originalBarcode: ']Q30112345678901234',
    })
  })

  it('figures out GTIN and BATCH/LOT in the same code', () => {
    expect(parser({ barcode: '0112345678901234101337' })).toMatchObject({
      symbology: 'unknown',
      elements: [
        {
          ai: '01',
          raw: '12345678901234',
          title: 'GTIN',
          value: '12345678901234',
        },
        {
          ai: '10',
          raw: '1337',
          title: 'BATCH/LOT',
          value: '1337',
        },
      ],
      originalBarcode: '0112345678901234101337',
    })
  })

  it('figures out GTIN and BATCH/LOT in the same code', () => {
    expect(parser({ barcode: '0112345678901234101337' })).toMatchObject({
      symbology: 'unknown',
      elements: [
        {
          ai: '01',
          raw: '12345678901234',
          title: 'GTIN',
          value: '12345678901234',
        },
        {
          ai: '10',
          raw: '1337',
          title: 'BATCH/LOT',
          value: '1337',
        },
      ],
      originalBarcode: '0112345678901234101337',
    })
  })

  it('handles cases where variablelength occurs first', () => {
    const FNC = String.fromCharCode(29)
    expect(parser({ barcode: `101337${FNC}0112345678901234` })).toMatchObject({
      symbology: 'unknown',
      elements: [
        {
          ai: '10',
          raw: `1337${FNC}`,
          title: 'BATCH/LOT',
          value: '1337',
        },
        {
          ai: '01',
          raw: '12345678901234',
          title: 'GTIN',
          value: '12345678901234',
        },
      ],
      originalBarcode: `101337${FNC}0112345678901234`,
    })
  })

  it('allows multi-character FNC', () => {
    const fnc = '{GS}'
    const barcode = `107473020${fnc}217473020-000`

    expect(parser({ barcode, fnc })).toMatchObject({
      elements: [
        {
          ai: '10',
          raw: `7473020${fnc}`,
          title: 'BATCH/LOT',
          value: '7473020',
        },
        {
          ai: '21',
          raw: '7473020-000',
          title: 'SERIAL',
          value: '7473020-000',
        },
      ],
    })
  })

  it('allows multibyte (emoji) FNC', () => {
    const fnc = '🥉'
    const barcode = `107473020${fnc}217473020-000`

    expect(parser({ barcode, fnc })).toMatchObject({
      elements: [
        {
          ai: '10',
          raw: `7473020${fnc}`,
          title: 'BATCH/LOT',
          value: '7473020',
        },
        {
          ai: '21',
          raw: '7473020-000',
          title: 'SERIAL',
          value: '7473020-000',
        },
      ],
    })
  })
})

describe('live examples parse as expected', () => {
  const FNC = String.fromCharCode(29)

  // https://www.packagingstrategies.com/ext/resources/ISSUES/2017/10-October/MPC-C-2DBarcode.jpg
  it('(21)123456789012{FNC}(17)131000(10)A1234567', () => {
    const parsed = parser({ barcode: `]d221123456789012${FNC}1713100010A1234567` })
    expect(parsed).toMatchObject({
      symbology: 'GS1 DataMatrix',
      elements: [
        {
          ai: '21',
          raw: `123456789012${FNC}`,
          title: 'SERIAL',
          value: '123456789012',
        },
        {
          ai: '17',
          title: 'USE BY OR EXPIRY',
          value: '2013-10-00',
        },
        {
          ai: '10',
          raw: 'A1234567',
          title: 'BATCH/LOT',
          value: 'A1234567',
        },
      ],
    })
  })

  // http://support.efficientbi.com/wp-content/uploads/2D-GS1-Code-Sample.png
  it('(01)50311704620018(21)123456789012{FNC}(17)180531(10)S12345', () => {
    const parsed = parser({ barcode: `015031170462001821123456789012${FNC}1718053110S12345` })
    expect(parsed).toMatchObject({
      symbology: 'unknown',
      elements: [
        {
          ai: '01',
          title: 'GTIN',
          value: '50311704620018',
          raw: `50311704620018`,
        },
        {
          ai: '21',
          title: 'SERIAL',
          value: '123456789012',
          raw: `123456789012${FNC}`,
        },
        {
          ai: '17',
          title: 'USE BY OR EXPIRY',
          value: '2018-05-31',
          raw: '180531',
        },
        {
          ai: '10',
          title: 'BATCH/LOT',
          value: 'S12345',
          raw: 'S12345',
        },
      ],
    })
  })

  // https://shop.wanderlust-webdesign.com/wp-content/uploads/2014/06/ff1hsg.png
  it('(420)95747(94)77707123456123456781', () => {
    const parsed = parser({ barcode: `42095747${FNC}9477707123456123456781` })
    expect(parsed).toMatchObject({
      elements: [
        {
          ai: '420',
          title: 'SHIP TO POST',
          value: '95747',
          raw: `95747${FNC}`,
        },
        {
          ai: '94',
          title: 'INTERNAL',
          value: '77707123456123456781',
          raw: `77707123456123456781`,
        },
      ],
    })
  })

  // https://www.palletlabel.com/wp-content/uploads/2018/10/Palletlabel-SSCC-label-EDI-klein.png
  it('(02)05060478880004(37)66(10)123abc(00)990000100000001862', () => {
    const parsed = parser({ barcode: `02050604788800043766${FNC}10123abc${FNC}00990000100000001862` })
    expect(parsed).toMatchObject({
      symbology: 'unknown',
      elements: [
        {
          ai: '02',
          title: 'CONTENT',
          value: '05060478880004',
          raw: `05060478880004`,
        },
        {
          ai: '37',
          title: 'COUNT',
          value: '66',
          raw: `66${FNC}`,
        },
        {
          ai: '10',
          title: 'BATCH/LOT',
          value: '123abc',
          raw: `123abc${FNC}`,
        },
        {
          ai: '00',
          raw: '990000100000001862',
          title: 'SSCC',
          value: '990000100000001862',
        },
      ],
    })
  })
})
