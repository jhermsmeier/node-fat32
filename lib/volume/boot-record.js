/**
 * Volume Boot Record (VBR) / Boot Parameter Block (BPB)
 * @constructor
 * @memberOf FAT
 * @returns {VBR}
 */
function VBR() {

  if( !(this instanceof VBR) ) {
    return new VBR()
  }

  /** @type {Buffer} x86 instruction (JMP SHORT 0x58; NOP) */
  this.jmp = new Buffer([ 0xEB, 0x58, 0x90 ])
  /** @type {String} 8 char OEM name */
  this.oemName = 'NPMFAT32'
  /** @type {Number} Bytes per sector (valid values: 512, 1024, 2048, 4096) */
  this.sectorSize = 4096
  /** @type {Number} Sectors per cluster (power of 2) */
  this.sectorsPerCluster = 1
  /** @type {Number} Number of reserved sectors */
  this.reservedSectors = 1
  /** @type {Number} Number of FATs */
  this.numberOfFATs = 2
  /** @type {Number} Number of root directory entries */
  this.rootDirEntries = 0
  /** @type {Number} Total number of sectors */
  this.sectorCount = 0
  /** @type {Number} Media Descriptor Byte */
  this.mediaType = 0xF8 // 0xF8 = HDD, 0xFA = RAMDisk, else FDD
  /** @type {Number} Number of sectors per FAT */
  this.sectorsPerFAT = 1
  /** @type {Number} Number of sectors per track */
  this.sectorsPerTrack = 1
  /** @type {Number} Number of heads */
  this.numberOfHeads = 0
  /** @type {Number} Number of sectors between MBR and VBR */
  this.hiddenSectors = 0
  /** @type {String} File system type */
  this.fsType = 'FAT32   '

  /** @type {Number} Flags */
  this.flags = 0x0000
  /** @type {Number} Version (usually zero) */
  this.version = '0.0'
  /** @type {Number} Sector at which the root cluster starts */
  this.rootClusterSector = 2
  /** @type {Number} Location of the FSInfo sector */
  this.fsInfoSector = 0
  /** @type {Number} Location of the VBR copy */
  this.mirrorSector = 6
  /** @type {Number} Reserved. Zero. */
  this.reserved = Buffer.alloc( 12, 0 )
  /** @type {Number} Physical BIOS drive number */
  this.driveNumber = 0
  /** @type {Number} Reserved. Often used to mark possibly corrupted volumes */
  this.corrupted = 0
  /** @type {Number} Extended boot signature, usually 41 */
  this.extendedSignature = 0x29
  /** @type {Number} Volume identifier */
  this.id = 0
  /** @type {Number} Volume name */
  this.name = '           '

  /** @type {Buffer} Bootloader code (420 B for FAT32, otherwise 448 B) */
  this.code = Buffer.alloc( 420, 0 )
  /** @type {Number} Signature */
  this.signature = 0x55AA

}

/**
 * VBR prototype
 * @ignore
 */
VBR.prototype = {

  constructor: VBR,

  parse( buffer, offset ) {

    offset = offset || 0

    this.signature = buffer.readUInt16LE( offset + 0x1FE )

    if( buffer.length < offset + 512 ) {
      throw new Error( 'Buffer too small, must be at least 512 bytes' )
    }

    if( this.signature !== 0xAA55 ) {
      throw new Error(
        'Invalid boot record signature: 0x' +
        this.signature.toString(16).toUpperCase()
      )
    }

    buffer.copy( this.jmp, 0, offset + 0x00, offset + 0x03 )

    this.oemName = buffer.toString( 'ascii', offset + 0x03, offset + 0x0B )
    this.sectorSize = buffer.readUInt16LE( offset + 0x0B )
    this.sectorsPerCluster = buffer.readUInt8( offset + 0x0D )
    this.reservedSectors = buffer.readUInt16LE( offset + 0x0E )
    this.numberOfFATs = buffer.readUInt8( offset + 0x10 )
    this.rootDirEntries = buffer.readUInt16LE( offset + 0x11 )
    this.sectorCount = buffer.readUInt16LE( offset + 0x13 )
    this.mediaType = buffer.readUInt8( offset + 0x15 )
    this.sectorsPerFAT = buffer.readUInt16LE( offset + 0x16 )
    this.sectorsPerTrack = buffer.readUInt16LE( offset + 0x18 )
    this.numberOfHeads = buffer.readUInt16LE( offset + 0x1A )
    this.hiddenSectors = buffer.readUInt32LE( offset + 0x1C )

    // Read number of sectors from 0x20, if sectorCount @ 0x13 == 0,
    // indicating that sector count > 16bit
    this.sectorCount = this.sectorCount === 0x0000 ?
      buffer.readUInt32LE( offset + 0x20 ) :
      this.sectorCount

    // For FAT12 & FAT16, the fs type is stored in 8 chars @ 0x36
    this.fsType = buffer.toString( 'ascii', 0x36, 0x3E )
    // For FAT32, at 0x52
    if( !/^FAT(12|16|32)/.test( this.fsType ) ) {
      this.fsType = buffer.toString( 'ascii', 0x52, 0x5A )
    }

    this.flagsLocs = [
      buffer.readUInt8( offset + 0x25 ),
      buffer.readUInt8( offset + 0x28 ),
      buffer.readUInt8( offset + 0x41 ),
    ]

    if( /^FAT(12|16)/.test( this.fsType ) ) {
      this.driveNumber = buffer.readUInt8( offset + 0x24 )
      this.corrupted = buffer.readUInt8( offset + 0x25 )
      this.extendedSignature = buffer.readUInt8( offset + 0x26 )
      this.id = buffer.readUInt32LE( offset + 0x27 )
      this.name = buffer.toString( 'ascii', offset + 0x2B, offset + 0x36 )
      // this.fsType = buffer.toString( 'ascii', offset + 0x36, offset + 0x3E )
      this.flags = buffer.readUInt8( offset + 0x41 )
      this.code = Buffer.alloc( 448, 0 )
      buffer.copy( this.code, 0, offset + 0x3E, offset + 0x1FE )
    } else {
      this.sectorsPerFAT = buffer.readUInt32LE( offset + 0x24 )
      this.mirrorFlags = buffer.readUInt16LE( offset + 0x28 )
      this.version = buffer.readUInt8( offset + 0x2A ) +
        '.' + buffer.readUInt8( offset + 0x2B )
      this.rootCluster = buffer.readUInt32LE( offset + 0x2C )
      this.fsInfoSector = buffer.readUInt16LE( offset + 0x30 )
      this.mirrorSector = buffer.readUInt16LE( offset + 0x32 )
      buffer.copy( this.reserved, 0, offset + 0x34, offset + 0x40 )
      this.driveNumber = buffer.readUInt8( offset + 0x40 )
      this.corrupted = buffer.readUInt8( offset + 0x41 )
      this.extendedSignature = buffer.readUInt8( offset + 0x42 )
      this.id = buffer.readUInt32LE( offset + 0x43 )
      this.name = buffer.toString( 'ascii', offset + 0x47, offset + 0x52 )
      this.code = Buffer.alloc( 420, 0 )
      buffer.copy( this.code, 0, offset + 0x5A, offset + 0x1FE )
    }

    return this

  },

}

// Exports
module.exports = VBR
