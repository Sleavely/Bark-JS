# Bark JS

 Parse barcode inputs into a unified GS1-128 format.

## What it does

Bark parses GS1-128 barcodes and extracts the catalogued data according to the [GS1 General Specifications (PDF)](https://www.gs1.org/sites/default/files/docs/barcodes/GS1_General_Specifications.pdf)

## How to use it

```
npm install bark-js
```

### Examples

Let's pretend we scan [the box in this photo](https://goo.gl/photos/HCE7WrNHDKvQL5ei8).

```javascript
const bark = require('bark-js')

bark( '015730033004265615171019' )
// returns:
{
  symbology: 'unknown',
  elements: [
    {
      ai: '01',
      title: 'GTIN',
      value: '57300330042656',
      raw: '57300330042656'
    },
    {
      ai: '15',
      title: 'BEST BEFORE or BEST BY',
      value: '2017-10-19',
      raw: '171019'
    }
  ],
  originalBarcode: '015730033004265615171019'
}
```

If you are going to scan simple barcodes too (e.g. UPC-A, EAN-13, ITF-14, etc.) you can set the `assumeGtin` option to convert shorter barcodes (11-14 digits) into GS1-128 codes with a GTIN AI:

```
const bark = require('bark-js')

bark( '09002490100094', { assumeGtin: true } )
// returns:
{
  symbology: 'unknown',
  elements: [
    {
      ai: '01',
      title: 'GTIN',
      value: '09002490100094',
      raw: '09002490100094'
    }
  ],
  originalBarcode: '0109002490100094'
}
```

Depending on your barcode reader, you may receive FNC characters that arent the `<GS>` (ASCII 29) character. To set the group separator yourself, pass the `fnc` option:

```javascript
const bark = require('bark-js')

bark( '10FRIDGEX0109002490100094', { fnc: 'X' } )
// returns:
{
  symbology: 'unknown',
  elements: [
    {
      ai: '10',
      title: 'BATCH/LOT',
      value: 'FRIDGE',
      raw: 'FRIDGEX'
    },
    {
      ai: '01',
      title: 'GTIN',
      value: '09002490100094',
      raw: '09002490100094'
    }
  ],
  originalBarcode: '10FRIDGEX0109002490100094'
}
```

## Contributing

Pull requests to Sleavely/Bark-JS are encouraged and appreciated!
