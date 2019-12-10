/*
  Use `npm test` to run tests using mocha.
  or `./node_modules/.bin/mocha --reporter spec`
*/

const src = require('path').resolve(process.cwd(), 'src')
const bark = require(`${src}/index.js`)

describe('Bark', () => {
  it('should load as a module', () => {
    expect(bark).toBeDefined()
  })

  describe('assumeGtin', () => {
    it('should parse an EAN-13', () => {
      const parsed = bark('3281014704901', { assumeGtin: true })
      expect(parsed).toMatchObject({
        elements: expect.arrayContaining([
          expect.objectContaining({ title: 'GTIN', value: '03281014704901' }),
        ]),
      })
    })

    it('should parse an ITF14', () => {
      const parsed = bark('17312133015982', { assumeGtin: true })
      expect(parsed).toMatchObject({
        elements: expect.arrayContaining([
          expect.objectContaining({ title: 'GTIN', value: '17312133015982' }),
        ]),
      })
    })

    it('should parse the GTIN from a GS1-128 code', () => {
      const parsed = bark('015730033004934115160817', { assumeGtin: true })
      expect(parsed).toMatchObject({
        elements: expect.arrayContaining([
          expect.objectContaining({ title: 'GTIN', value: '57300330049341' }),
        ]),
      })
    })
  })

  it('should parse the BEST BEFORE', () => {
    const parsed = bark('015730033004934115160817')
    expect(parsed).toMatchObject({
      elements: expect.arrayContaining([
        expect.objectContaining({ title: 'BEST BEFORE or BEST BY', value: '2016-08-17' }),
      ]),
    })
  })

  it('should parse the NET WEIGHT with 3 decimal points', () => {
    const parsed = bark('01573003300493413103160817')
    expect(parsed).toMatchObject({
      elements: expect.arrayContaining([
        expect.objectContaining({ title: 'NET WEIGHT (kg)', value: '160.817' }),
      ]),
    })
  })
})
