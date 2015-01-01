/**
 * Entry Constructor
 * @return {Entry}
 */
function Entry( options ) {
  
  if( !(this instanceof Entry) )
    return new Entry( options )
  
}

/**
 * Entry Prototype
 * @type {Object}
 */
Entry.prototype = {
  
  constructor: Entry,
  
  parse: function( buffer ) {
    
    // bit 6: last logical, first physical LFN entry, bit 5: 0;
    // deleted entry: 0xE5
    this.sequenceNumber = buffer.readUInt8( 0 )
    // bits 4-0: number 0x01..0x14 (0x1F)
    this.number = buffer.readUInt8( 0 ) & 0x1F
    this.attr = buffer.readUInt8( 11 )
    this.type = buffer.readUInt8( 12 )
    this.checksum = buffer.readUInt8( 13 )
    this.firstCluster = buffer.readUInt16LE( 26 )
    this.chars = buffer.toString( 'ucs2', 1, 11 ) +
      buffer.toString( 'ucs2', 14, 26 ) +
      buffer.toString( 'ucs2', 28, 32 )
    
    // LFNs strings end with \u0000 and
    // are padded with \uFFFF after that
    this.chars = this.chars.replace( /\u0000|\uFFFF/g, '' )
    
    return this
    
  },
  
  toBuffer: function() {
    
    var buffer = new Buffer( 32 )
    buffer.fill( 0 )
    
    
    
    return buffer
    
  },
  
}

// Exports
module.exports = Entry
