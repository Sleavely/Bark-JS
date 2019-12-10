# Bark JS

 Parse barcode inputs into a unified format.


## What it does

Bark normalises and treats all barcode inputs as the GS1-128 format.

Bark attempts to figure out which standard the string uses (EAN-8, EAN-13, ITF-14, GS1-128, etc.) and extracts the relevant data. It is accessed by querying Bark for the GS1 Application Identifier's Data Title. For a reference of the Data Titles, see the right-most column here: [GS1 General Specifications Section 3.2: GS1 Application Identifier Definitions (PDF)](https://www.gs1.org/sites/default/files/docs/barcodes/GS1_General_Specifications.pdf)

## How to use it

```
npm install bark-js
```

### Examples

Let's pretend we scan [the box in this photo](https://goo.gl/photos/HCE7WrNHDKvQL5ei8).

```javascript
var Bark = require('bark-js');
var yourInput = '015730033004265615171019';

console.log(Bark.parse( yourInput )); // parse returns the GTIN, or undefined

// Always set after successful parse
console.log(Bark.type); // GS1-128

// These Application Identifiers (AIs) exist in the barcode
console.log(Bark.get('GTIN')); // 57300330042656
console.log(Bark.get('BEST BEFORE')); // 171019

// The SERIAL AI is not set on this barcode
console.log(Bark.get('SERIAL')); // null
```

If you are going to scan regular barcodes too (e.g. EAN-13, ITF-14, etc.) and only want to get the GTIN, we suggest you use the `id()` method.

The important distinction from `parse()` is that `id()` will return the string itself if the barcode was not interpreted as GS1-128.

```javascript
var Bark = require('bark-js');
var yourInput = '015730033004265615171019';

console.log(Bark.id( yourInput )); // 57300330042656

yourInput = 'Foo-And-Oth3r-Bars';
console.log(Bark.id( yourInput )); // Foo-And-Oth3r-Bars
```

## Contributing

Pull requests to Sleavely/Bark-JS are encouraged and appreciated!
