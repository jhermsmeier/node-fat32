const CHAR_BUFFER = Buffer.alloc( 10 + 12 + 4 )

class LFNFragment {

  constructor() {

    this.seqNo = 0
    this.number = 0
    this.attr = 0
    this.type = 0
    this.checksum = 0
    this.firstCluster = 0
    this.chars = ''

  }

  // Whether this is the last logical LFN entry (bit 6 is set)
  // and thus the one with the highest sequence number
  get lastSeqNo() {
    return this.seqNo & 0x20 === 0x20
  }

  parse( buffer, offset ) {

    offset = offset || 0

    this.seqNo = buffer[ offset + 0 ]
    this.number = this.seqNo & 0x0F
    this.attr = buffer[ offset + 11 ]
    this.type = buffer[ offset + 12 ]
    this.checksum = buffer[ offset + 13 ]
    this.firstCluster = buffer.readUInt16LE( offset + 26 )

    buffer.copy( CHAR_BUFFER, 0, offset + 1, offset + 11 )
    buffer.copy( CHAR_BUFFER, 10, offset + 14, offset + 26 )
    buffer.copy( CHAR_BUFFER, 22, offset + 28, offset + 32 )

    var eos = CHAR_BUFFER.indexOf( '\u0000', 'ucs2' )

    this.chars = eos !== -1 ?
      CHAR_BUFFER.toString( 'ucs2', 0, eos ) :
      CHAR_BUFFER.toString( 'ucs2' )

    return this

  }

  write( buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( LFNFragment.SIZE + offset )

    buffer[ offset + 0 ] = this.seqNo
    buffer[ offset + 11 ] = this.attr
    buffer[ offset + 12 ] = this.type
    buffer[ offset + 13 ] = this.checksum
    buffer.writeUInt16LE( this.firstCluster, offset + 26 )

    CHAR_BUFFER.fill( 0xFF )

    var eos = CHAR_BUFFER.write( this.chars, 'ucs2' )

    CHAR_BUFFER.writeUInt16LE( 0x0000, eos )
    CHAR_BUFFER.copy( buffer, offset + 1, 0, 10 )
    CHAR_BUFFER.copy( buffer, offset + 14, 10, 22 )
    CHAR_BUFFER.copy( buffer, offset + 18, 22, 26 )

    return buffer

  }

}

LFNFragment.SIZE = 32

LFNFragment.ATTR = 0x0F
LFNFragment.DELETED = 0xE5

module.exports = LFNFragment
