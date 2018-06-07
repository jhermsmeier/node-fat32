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

  parse( buffer, offset ) {

    offset = offset || 0

    // bit 6: last logical, first physical LFN entry, bit 5: 0;
    // deleted entry: 0xE5
    this.sequenceNumber = buffer.readUInt8( offset + 0 )
    // bits 4-0: number 0x01..0x14 (0x1F)
    this.number = buffer.readUInt8( offset + 0 ) & 0x1F
    this.attr = buffer.readUInt8( offset + 11 )
    this.type = buffer.readUInt8( offset + 12 )
    this.checksum = buffer.readUInt8( offset + 13 )
    this.firstCluster = buffer.readUInt16LE( offset + 26 )
    this.chars = buffer.toString( 'ucs2', offset + 1, offset + 11 ) +
      buffer.toString( 'ucs2', offset + 14, offset + 26 ) +
      buffer.toString( 'ucs2', offset + 28, offset + 32 )

    // LFNs strings end with \u0000 and
    // are padded with \uFFFF after that
    this.chars = this.chars.replace( /\u0000|\uFFFF/g, '' )

    return this

  },

  write( buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( Entry.size )

    throw new Error( 'Not implemented' )

    return buffer

  },

}

// Exports
module.exports = Entry
