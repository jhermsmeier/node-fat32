/**
 * FSInfo Constructor
 * @param {Object} options
 * @return {FSInfo}
 */
function FSInfo( options ) {

  if( !(this instanceof FSInfo) )
    return new FSInfo( options )

  /** @type {Buffer} Reserved1 (480 bytes) */
  this.reserved1 = Buffer.alloc( 480, 0 )
  /** @type {Number} Number of free clusters */
  this.freeClusters = 0xFFFFFFFF
  /** @type {Number} Number of the most recently known to be allocated data cluster */
  this.lastCluster = 0xFFFFFFFF
  /** @type {Buffer} Reserved2 (12 bytes) */
  this.reserved2 = Buffer.alloc( 12, 0 )

}

/**
 * Size of FSInfo record
 * @type {Number}
 * @constant
 */
FSInfo.SIZE = 0x200

/**
 * ASCII 'RRaA' (0x52 0x52 0x61 0x41)
 * @type {Number}
 * @constant
 */
FSInfo.SIGNATURE_START = 0x41615252

/**
 * ASCII 'rrAa' (0x72 0x72 0x41 0x61)
 * @type {Number}
 * @constant
 */
FSInfo.SIGNATURE_END = 0x61417272

/**
 * Parse an FSInfo record
 * @param {Buffer} buffer
 * @param {Number} [offset=0]
 * @returns {FSInfo}
 */
FSInfo.parse = function( buffer ) {
  return new FSInfo().parse( buffer )
}

/**
 * FSInfo Prototype
 * @type {Object}
 */
 FSInfo.prototype = {

  constructor: FSInfo,

  /**
   * Parse an FSInfo record
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {FSInfo}
   */
  parse( buffer, offset ) {

    offset = offset || 0

    // NOTE: Actually, it would also be safe to set
    // 0xFFFFFFFF in case of invalidity - unless
    // it's a FAT32 implementation differing from
    // Microsoft's spec and using sector sizes less than 512

    // FS information sector signature (0x52 0x52 0x61 0x41)
    if( buffer.readUInt32LE( offset + 0x00 ) !== FSInfo.SIGNATURE_START )
      throw new Error( 'Invalid FS Information Sector signature' )

    // FS information sector signature (0x72 0x72 0x41 0x61)
    if( buffer.readUInt32LE( offset + 0x1E4 ) !== FSInfo.SIGNATURE_END )
      throw new Error( 'Invalid FS Information Sector signature' )

    // FS information sector signature (0x00 0x00 0x55 0xAA)
    if( buffer[ offset + 0x1FC ] !== 0x00 && buffer[ offset + 0x1FD ] !== 0x00 )
      throw new Error( 'Invalid VBR signature in sector' )
    if( buffer[ offset + 0x1FE ] !== 0x55 && buffer[ offset + 0x1FF ] !== 0xAA )
      throw new Error( 'Invalid VBR signature in sector' )

    // Reserved (should be cleared to 0x00 during format)
    buffer.copy( this.reserved1, 0, offset + 0x04, offset + 0x1E4 )

    // Last known number of free data clusters on the volume,
    // or 0xFFFFFFFF if unknown.
    this.freeClusters = buffer.readUInt32LE( offset + 0x1E8 )
    // Number of the most recently known to be allocated data cluster.
    // Should be set to 0xFFFFFFFF during format.
    // With 0xFFFFFFFF the system should start at cluster 0x00000002.
    this.lastCluster = buffer.readUInt32LE( offset + 0x1EC )

    // Reserved (should be cleared to 0x00 during format)
    buffer.copy( this.reserved2, 0, offset + 0x1F0, offset + 0x1FC )

    return this

  },

  /**
   * Write an FSInfo record to a buffer
   * @param {Buffer} [buffer=Buffer(FSInfo.SIZE)]
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {

    buffer = buffer || Buffer.alloc( FSInfo.SIZE )
    offset = offset || 0

    buffer.writeUInt32LE( FSInfo.SIGNATURE_START, offset + 0x00 )

    this.reserved1.copy( buffer, offset + 0x04 )

    buffer.writeUInt32LE( this.freeClusters, offset + 0x1E8 )
    buffer.writeUInt32LE( this.lastCluster, offset + 0x1EC )
    buffer.writeUInt32LE( FSInfo.SIGNATURE_END, offset + 0x1E4 )

    this.reserved2.copy( buffer, offset + 0x1F0 )

    buffer[ offset + 0x1FC ] = 0x00
    buffer[ offset + 0x1FD ] = 0x00
    buffer[ offset + 0x1FE ] = 0x55
    buffer[ offset + 0x1FF ] = 0xAA

    return buffer

  },

}

// Exports
module.exports = FSInfo
