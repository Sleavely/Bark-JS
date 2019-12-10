/*
  Use `npm test` to run tests using mocha.
  or `./node_modules/.bin/mocha --reporter spec`
*/

var path = require('path')
var Bark = require(path.resolve(path.join(__dirname, '..')))

describe('Bark', function () {
  it('should load as a module', function (done) {
    expect(Bark).toBeDefined()
    done()
  })
  it('should set its config', function (done) {
    expect(Bark.config).toBeDefined()
    done()
  })
  it('should default to safe mode', function (done) {
    expect(Bark.config.safemode).toEqual(true)
    done()
  })
  it('should default to non-verbosity', function (done) {
    expect(Bark.config.verbose).toEqual(false)
    done()
  })
})

describe('Bark.parse()', function () {
  it('should parse an EAN-13', function (done) {
    Bark.parse('3281014704901')
    expect(Bark.type).toEqual('EAN-13')
    done()
  })

  it('should parse an ITF-14', function (done) {
    Bark.parse('17312133015982')
    expect(Bark.type).toEqual('ITF-14')
    done()
  })
  it('should parse an ITF-14', function (done) {
    Bark.parse('17312133015982')
    expect(Bark.type).toEqual('ITF-14')
    done()
  })

  it('should parse the GTIN from a GS1-128 code', function (done) {
    Bark.parse('015730033004934115160817')
    expect(Bark.id()).toEqual('57300330049341')
    expect(Bark.get('GTIN')).toEqual('57300330049341')
    done()
  })

  it('should parse the BEST BEFORE', function (done) {
    Bark.parse('015730033004934115160817')
    expect(Bark.get('BEST BEFORE')).toEqual('160817')
    done()
  })

  it('should parse the NET WEIGHT with 3 decimal points', function (done) {
    Bark.parse('01573003300493413103160817')
    expect(Bark.get('NET WEIGHT')).toEqual(160.817)
    done()
  })
  it('should parse the NET WEIGHT without decimal points', function (done) {
    Bark.parse('01573003300493413100160817')
    expect(Bark.get('NET WEIGHT')).toEqual(160817)
    done()
  })

  it('should clear parsed AIs in safemode when it encounters an error', function (done) {
    Bark.parse('01573003300493419999999999999')
    expect(Bark.id()).toEqual('01573003300493419999999999999')
    expect(Bark.get('GTIN')).toEqual(undefined)
    done()
  })
  it('should not clear parsed AIs in when safemode is off', function (done) {
    Bark.setConfig({ safemode: false })
    Bark.parse('01573003300493419999999999999')
    expect(Bark.get('GTIN')).toEqual('57300330049341')
    done()
  })
})

describe('Bark.id()', function () {
  it('should return the string itself when parse fails', function (done) {
    Bark.parse('foo bar')
    expect(Bark.id()).toEqual('foo bar')
    expect(Bark.get('GTIN')).toEqual(undefined)
    done()
  })
})
