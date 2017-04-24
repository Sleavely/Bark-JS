# Bark JS

 Parse barcode inputs into a unified format.


## What it does

Bark normalises and treats all barcode inputs as the GS1-128 format.

Bark attempts to figure out which standard the string uses (EAN-8, EAN-13, ITF-14, GS1-128, etc.) and extracts the relevant data. It is accessed by querying Bark for the GS1 Application Identifier's Data Title. For a reference of the Data Titles, see the right-most column here: [GS1 General Specifications Section 3: GS1 Application Identifier Definitions (PDF)](http://www.gs1.se/globalassets/gs1-application-identifiers-in-numerical-order.pdf)

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

## Licence

(MIT License)

Copyright (c) 2017 Joakim Hedlund

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
