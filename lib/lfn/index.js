/**
 * Long File Name (LFN) Constructor
 * @constructor
 * @memberOf FAT
 * @returns {LFN}
 */
function LFN() {

  if( !(this instanceof LFN) ) {
    return new LFN()
  }

  /** @type {Array<LFN.Entry>} LFN entries */
  this.entries = []

}

/**
 * [CHARS_PER_ENTRY description]
 * NOTE: Where does it say this is 26 chars?
 * Is it 26 chars, or 26 bytes?
 * @type {Number}
 * @constant
 */
LFN.CHARS_PER_ENTRY = 26

LFN.Entry = require( './entry' )

/**
 * LFN Prototype
 * @type {Object}
 */
LFN.prototype = {

  constructor: LFN,

  parseEntry( buffer, offset ) {
    this.entries.push( new LFN.Entry().parse( buffer, offset ) )
  },

  getFileName() {

    var fileName = ''

    for( var i = this.entries.length - 1; i >= 0 ; i-- ) {
      fileName += this.entries[i].chars
    }

    return fileName

  },

  setFileName( str ) {

    var entries = Math.ceil( str.length / 26 )
    var offset = 0

    this.entries = []

    while( offset < str.length ) {
      var entry = new LFN.Entry()
      entry.chars = str.substring( offset, offset + 26 )
      this.entries.push( entry )
      offset += 26
    }

    return this

  },

}

// Exports
module.exports = LFN
