"use strict";

/*
 *  npm-boilerplate
 *  http://github.com/sdeering/npm-boilerplate
 *  A good starting point for your new Node.js NPM packages.
 */


/**
 * Module constructor.
 */
function Bark(input, optConfig) {
    this.init();

    if (typeof input == 'string') {
        this.setConfig(optConfig);
        this.parse(input);
    } else {
        this.setConfig(optConfig);
    }

    // If by now we don't have a set config lets force it.
    if (!this.config) this.setConfig();
};

/**
 * Module init.
 */

Bark.prototype.init = function() {

    // We'll be storing application identifiers here.
    this.AIs = {};

};

Bark.prototype.setConfig = function(overrides) {
    if (typeof overrides != 'object') {
        overrides = {};
    }

    var defaults = {
        'safemode': true,
        'verbose': false
    };

    // Mini-jQuery.extend(). Not recursive
    var computed = {};
    for (var attrname in defaults) { computed[attrname] = defaults[attrname]; }
    for (var attrname in overrides) { computed[attrname] = overrides[attrname]; }

    this.config = computed;
}

Bark.prototype.AIparsers = {
    '00': function(inputVal, startPos) {
        this.AIs['SSCC'] = inputVal.substr(startPos + 2, 18);
        return startPos + 2 + 18;
    },
    '01': function(inputVal, startPos) {
        this.AIs['GTIN'] = inputVal.substr(startPos + 2, 14);
        this.AIs['NDC'] = inputVal.substr(startPos + 5, 10);
        return startPos + 2 + 14;
    },
    '10': function(inputVal, startPos) {
        var lotLength = inputVal.length - (startPos + 2);
        this.AIs['LOT'] = inputVal.substr(startPos + 2, lotLength);
        return startPos + 2 + lotLength;
    },
    '11': function(inputVal, startPos) {
        this.AIs['PROD DATE'] = inputVal.substr(startPos + 2, 6);
        return startPos + 2 + 6;
    },
    '12': function(inputVal, startPos) {
        this.AIs['DUE DATE'] = inputVal.substr(startPos + 2, 6);
        return startPos + 2 + 6;
    },
    '13': function(inputVal, startPos) {
        this.AIs['PACK DATE'] = inputVal.substr(startPos + 2, 6);
        return startPos + 2 + 6;
    },
    '15': function(inputVal, startPos) {
        this.AIs['BEST BEFORE'] = inputVal.substr(startPos + 2, 6);
        return startPos + 2 + 6;
    },
    '16': function(inputVal, startPos) {
        this.AIs['SELL BY'] = inputVal.substr(startPos + 2, 6);
        return startPos + 2 + 6;
    },
    '17': function(inputVal, startPos) {
        this.AIs['USE BY'] = inputVal.substr(startPos + 2, 6);
        var year = this.AIs['USE BY'].substr(0, 2);
        var month = this.AIs['USE BY'].substr(2, 2);
        var day = this.AIs['USE BY'].substr(4, 2);
        this.AIs['USE BY DATE'] = new Date(month + '/' + day + '/' + year)
        return startPos + 2 + 6;
    },
    '310': function(inputVal, startPos) {
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

Bark.prototype.parse = function(inputVal) {

    // Resetting things.
    this.input = inputVal;
    this.init();

    var hasLeadingZero = inputVal.substring(0, 1) == '0';
    var isNumeric = /^\d+$/.test(inputVal);

    if (isNumeric) {
        // Until we have decided what type of barcode we're dealing with
        this.type = 'unknown-numeric';
        this.AIs['GTIN'] = inputVal;

        if (inputVal.length == 11) {
            this.type = 'UPC-A';
            //TODO: The check digit may have been omitted. should we attempt to add it ourselves?
        } else if (inputVal.length == 12) {
            this.type = 'UPC-A';
            //TODO: should we pad inputVal it and make it EAN-13?
        } else if (inputVal.length == 13) {
            this.type = 'EAN-13';
        } else if (inputVal.length == 14) {
            this.type = 'ITF-14';
        }
    } else {
        if (this.config.verbose) console.log('parse(): The input is not digits-only. Not attempting to parse further.');
    }

    // Likely a GS1-like barcode. Lets hope so.
    if (inputVal.length > 14 && isNumeric) {
        this.type = 'GS1-128';

        // we need to go through all the AIs, char for char. :/
        var currPos = 1,
            startPos = 0;
        while (currPos < inputVal.length) {
            var guessAI = inputVal.substr(startPos, currPos);

            // Every time we cant guess the next AI we make the gap just a little bigger.
            // Otherwise jump.
            if (!this.AIparsers[guessAI]) {
                // I.e. if we just tried to find a method for "0" in the string "015730033004934115160817", try "01" next time
                currPos++;
            } else {
                // The AI parser will return the end position of its data
                startPos = this.AIparsers[guessAI].call(this, inputVal, startPos);
                currPos = 1;
            }
        }

        // Check if we parsed everything there was to parse
        if (startPos != inputVal.length) {
            if (this.config.verbose) console.log('Failed to parse all AIs!', { 'last startPos': startPos, 'remaining string': inputVal.substr(startPos), 'this': this });
            if (this.config.safemode) {
                // Reset AIs and type, since we cant be 100% sure its GS1-128
                this.type = undefined;
                this.AIs = {};
            }
        }
    }

    return this.AIs['GTIN'];
};


Bark.prototype.get = function(ai) {
    return this.AIs[ai];
}

Bark.prototype.id = function(inputVal) {
    if (inputVal) this.parse(inputVal);

    return this.AIs['GTIN'] || this.input;
}

/**
 * Export default singleton.
 *
 * @api public
 */
if (typeof module !== 'undefined' && typeof exports === 'object') {
    exports = module.exports = new Bark();
}
