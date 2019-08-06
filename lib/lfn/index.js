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

  /** @type {Array<LFN.Fragment>} LFN fragments */
  this.fragments = []

}

LFN.Fragment = require( './fragment' )

/**
 * LFN Prototype
 * @type {Object}
 */
LFN.prototype = {

  constructor: LFN,

  get size() {
    return this.fragments.length * LFN.Fragment.SIZE
  },

  parseEntry( buffer, offset ) {
    this.fragments.push( new LFN.Fragment().parse( buffer, offset ) )
  },

  getFileName() {

    var fileName = ''

    // Concat in reverse, as logically last entry appears first on disk
    // NOTE: We're not sorting by their seqNo here, as that lets us still
    // read deleted LFN entries properly
    for( var i = 0; i < this.fragments.length; i++ ) {
      fileName = this.fragments[i].chars + fileName
    }

    return fileName

  },

  setFileName( str ) {

    var fragments = Math.ceil( str.length / 26 )
    var offset = 0

    this.fragments = []

    while( offset < str.length ) {
      var fragment = new LFN.Fragment()
      fragment.chars = str.substring( offset, offset + 26 )
      this.fragments.push( fragment )
      offset += 26
    }

    return this

  },

}

// Exports
module.exports = LFN
