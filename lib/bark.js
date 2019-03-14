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

//Constructor to handle variable length AIs
function VariableLengthAI(inputVal, startPos, aiMaxLength){
    var gsChar = '<';
    var gsLength = 6;
    var escapeCharStart = inputVal.substr(startPos, inputVal.length).indexOf(gsChar) - 2;
    if (escapeCharStart > 0 && escapeCharStart < aiMaxLength){
        this.aiValue = inputVal.substr(startPos + 2, escapeCharStart);
        this.newStartPos = startPos + 2 + escapeCharStart + gsLength; //Add an extra characters to skip over GS.
    }
    //Check to see if AI is the last AI in the string.
    else if (inputVal.length <= (aiMaxLength + 2)){
        var aiLength = inputVal.length - (startPos + 2);
        this.aiValue = inputVal.substr(startPos + 2, aiLength);
        this.newStartPos = startPos + 2 + aiLength;
    }
    //Otherwise assume AI is the max length allowed.
    else {
        this.aiValue = inputVal.substr(startPos + 2, aiMaxLength);
        this.newStartPos = startPos + 2 + aiMaxLength;
    }
};

Bark.prototype.AIparsers = {
    '00': function(inputVal, startPos){
        this.AIs['SSCC'] = inputVal.substr(startPos + 2, 18);
        if(this.AIs)
            return startPos + 2 + 18;
    },
    '01': function(inputVal, startPos){
        this.AIs['GTIN'] = inputVal.substr(startPos + 2, 14);
        if (this.AIs['GTIN'].substr(0,3) === '003' || this.AIs['GTIN'].substr(0,3) === '103'  ){
            this.AIs['NDC'] = this.AIs['GTIN'].substr(3,10);
        }
        return startPos + 2 + 14;
    },
    '10': function(inputVal, startPos){
        var lotMaxLength = 20;
        var lot = new VariableLengthAI(inputVal, startPos, lotMaxLength);
        this.AIs['LOT'] = lot.aiValue;
        startPos = lot.newStartPos;
        return startPos;
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
        var year = parseInt('20' + this.AIs['USE BY'].substr(0, 2));
        var month = parseInt(this.AIs['USE BY'].substr(2, 2)) - 1;
        var day = parseInt(this.AIs['USE BY'].substr(4, 2));

        if (day === 0) {
            month += 1
        }

        this.AIs['USE BY DATE'] = new Date(year, month, day)
        return startPos + 2 + 6;
    },
    '21': function(inputVal,startPos){
        var serialMaxLength = 20;
        var serial = new VariableLengthAI(inputVal, startPos, serialMaxLength);
        this.AIs['SERIAL'] = serial.aiValue;
        startPos = serial.newStartPos;
        return startPos;
    },
    '30': function(inputVal, startPos){
        var itemCountMaxLength = 20;
        var itemCount = new VariableLengthAI(inputVal, startPos, itemCountMaxLength);
        this.AIs['ITEM COUNT'] = itemCount.aiValue;
        startPos = itemCount.newStartPos;
        return startPos;
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
    inputVal = inputVal.replace(/[()]/g, '');
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
            //See if the serial number starts with 3 which means it is a drug and the middle 20 digits are the NDC.
            if (inputVal.substr(0,1) === '3'){
                this.AIs['NDC'] = inputVal.substr(1,10);
            }
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

    // Likely a GS1-like barcode. Lets hope so.
    // Removed isNumeric test since GS1 serial numbers, lots, etc. can be alphanumeric.
    if(inputVal.length > 14)
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
        if(startPos < inputVal.length)
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
