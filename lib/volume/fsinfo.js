/**
 * FSInfo Constructor
 * @param {Object} options
 * @return {FSInfo}
 */
function FSInfo( options ) {

  if( !(this instanceof FSInfo) )
    return new FSInfo( options )

  this.reserved1 = Buffer.alloc( 480, 0 )
  this.freeClusters = 0xFFFFFFFF
  this.lastCluster = 0xFFFFFFFF
  this.reserved2 = Buffer.alloc( 12, 0 )

}

FSInfo.parse = function( buffer ) {
  return new FSInfo().parse( buffer )
}

/**
 * FSInfo Prototype
 * @type {Object}
 */
 FSInfo.prototype = {

  constructor: FSInfo,

  parse: function( buffer ) {

    // NOTE: Actually, it would also be safe to set
    // 0xFFFFFFFF in case of invalidity - unless
    // it's a FAT32 implementation differing from
    // Microsoft's spec and using sector sizes less than 512

    // FS information sector signature (0x52 0x52 0x61 0x41)
    if( buffer.toString( 'ascii', 0x00, 0x04 ) !== 'RRaA' )
      throw new Error( 'Invalid FS Information Sector signature' )

    // FS information sector signature (0x72 0x72 0x41 0x61)
    if( buffer.toString( 'ascii', 0x1E4, 0x1E8 ) !== 'rrAa' )
      throw new Error( 'Invalid FS Information Sector signature' )

    // FS information sector signature (0x00 0x00 0x55 0xAA)
    if( buffer[ 0x1FC ] !== 0x00 && buffer[ 0x1FD ] !== 0x00 )
      throw new Error( 'Invalid VBR signature in sector' )
    if( buffer[ 0x1FE ] !== 0x55 && buffer[ 0x1FF ] !== 0xAA )
      throw new Error( 'Invalid VBR signature in sector' )

    // Reserved (should be cleared to 0x00 during format)
    buffer.copy( this.reserved1, 0, 0x04, 0x1E4 )

    // Last known number of free data clusters on the volume,
    // or 0xFFFFFFFF if unknown.
    this.freeClusters = buffer.readUInt32LE( 0x1E8 )
    // Number of the most recently known to be allocated data cluster.
    // Should be set to 0xFFFFFFFF during format.
    // With 0xFFFFFFFF the system should start at cluster 0x00000002.
    this.lastCluster = buffer.readUInt32LE( 0x1EC )

    // Reserved (should be cleared to 0x00 during format)
    buffer.copy( this.reserved2, 0, 0x1F0, 0x1FC )

    return this

  }

}

// Exports
module.exports = FSInfo
