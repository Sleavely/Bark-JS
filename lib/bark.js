"use strict";

/*
 *  npm-boilerplate
 *  http://github.com/sdeering/npm-boilerplate
 *  A good starting point for your new Node.js NPM packages.
 */


/**
 * Module constructor.
 */
function Bark( input ) {
  this.init();

  if(input) this.parse(input);
};

/**
 * Module init.
 */

Bark.prototype.init = function() {

  // We'll be storing application identifiers here.
  this.AIs = {};

};

Bark.prototype.AIparsers = {
  '00': function(inputVal, startPos){
    this.AIs['SSCC'] = inputVal.substr(startPos + 2, 18);
    return startPos + 2 + 18;
  },
  '01': function(inputVal, startPos){
    this.AIs['GTIN'] = inputVal.substr(startPos + 2, 14);
    return startPos + 2 + 14;
  },
  '11': function(inputVal, startPos){
    this.AIs['PROD DATE'] = inputVal.substr(startPos + 2, 6);
    return startPos + 2 + 6;
  },
  '12': function(inputVal, startPos){
    this.AIs['DUE DATE'] = inputVal.substr(startPos + 2, 6);
    return startPos + 2 + 6;
  },
  '13': function(inputVal, startPos){
    this.AIs['PACK DATE'] = inputVal.substr(startPos + 2, 6);
    return startPos + 2 + 6;
  },
  '15': function(inputVal, startPos){
    this.AIs['BEST BEFORE'] = inputVal.substr(startPos + 2, 6);
    return startPos + 2 + 6;
  },
  '16': function(inputVal, startPos){
    this.AIs['SELL BY'] = inputVal.substr(startPos + 2, 6);
    return startPos + 2 + 6;
  },
  '17': function(inputVal, startPos){
    this.AIs['USE BY'] = inputVal.substr(startPos + 2, 6);
    return startPos + 2 + 6;
  },
  '310': function(inputVal, startPos){
    var decimalPos = 0 - parseInt(inputVal.substr(startPos + 3, 1));
    var dataVal = inputVal.substr(startPos + 4, 6);
    var beforeDec = dataVal.slice(0, decimalPos);
    var afterDec = dataVal.slice(decimalPos);
    var floatilizedString = (beforeDec.length ? beforeDec + '.' : '') + afterDec;

    this.AIs['NET WEIGHT'] = parseFloat(floatilizedString);
    return startPos + 4 + 6;
  }
};

/**
 * Module public API example function - multiply
 */

Bark.prototype.parse = function( inputVal ) {

  // Resetting things.
  this.input = inputVal;
  this.init();

  console.log('Parsing input.', this.input);

  var hasLeadingZero = inputVal.substring(0,1) == '0';
  var isNumeric = /^\d+$/.test(inputVal);


  if(isNumeric)
  {
    // Until we have decided what type of barcode we're dealing with
    this.type = 'unknown-numeric';
    this.AIs['GTIN'] = inputVal;

    if(inputVal.length == 11)
    {
      this.type = 'UPC-A';
      //TODO: The check digit may have been omitted. should we attempt to add it ourselves?
    }
    else if(inputVal.length == 12)
    {
      this.type = 'UPC-A';
      //TODO: should we pad inputVal it and make it EAN-13?
    }
    else if(inputVal.length == 13)
    {
      this.type = 'EAN-13';
    }
    else if(inputVal.length == 14)
    {
      this.type = 'ITF-14';
    }
  }
  else
  {
    console.log('the barcode is not numeric :(');
  }

  // Likely a GS1-like barcode. Lets hope so.
  if(inputVal.length > 14 && isNumeric)
  {
    this.type = 'GS1-128';

    // we need to go through all the AIs, char for char. :/
    var currPos = 1,
      startPos = 0;
    while(currPos < inputVal.length)
    {
      var guessAI = inputVal.substr(startPos, currPos);

      // Every time we cant guess the next AI we make the gap just a little bigger.
      // Otherwise jump.
      if(!this.AIparsers[guessAI])
      {
        // I.e. if we just tried to find a method for "0" in the string "015730033004934115160817", try "01" next time
        currPos++;
      }
      else
      {
        // The AI parser will return the end position of its data
        startPos = this.AIparsers[guessAI].call(this, inputVal, startPos);
        currPos = 1;
      }
    }

    // Check if we parsed everything there was to parse
    if(startPos != inputVal.length)
    {
      console.log('Failed to parse all AIs!', {'last startPos': startPos, 'remaining string': inputVal.substr(startPos), 'this': this});
      return this.AIs['GTIN'];
    }
  }

  console.log('Parser finished.', this);
  return this.AIs['GTIN'];

};


Bark.prototype.get = function(ai) {
  return this.AIs[ai];
}

Bark.prototype.id = function( inputVal ) {
  if(inputVal) this.parse(inputVal);

  return this.AIs['GTIN'] || this.input;
}

/**
 * Export default singleton.
 *
 * @api public
 */
if(!module) module = {}; // Workaround in case someone includes this script without npm or similar
exports = module.exports = new Bark();
