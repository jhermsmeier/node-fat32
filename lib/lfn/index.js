/**
 * LFN Constructor
 * @return {LFN}
 */
function LFN() {
  
  if( !(this instanceof LFN) )
    return new LFN()
  
  this.entries = []
  
}

LFN.CHARS_PER_ENTRY = 26

LFN.Entry = require( './entry' )

/**
 * LFN Prototype
 * @type {Object}
 */
LFN.prototype = {
  
  constructor: LFN,
  
  parseEntry: function( buffer ) {
    this.entries.push(
      new LFN.Entry().parse( buffer )
    )
  },
  
  getFileName: function() {
    var fileName = ''
    for( var i = this.entries.length - 1; i >= 0 ; i-- )
      fileName += this.entries[i].chars
    return fileName
  },
  
  setFileName: function( str ) {
    
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
