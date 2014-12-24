/**
 * Volume Boot Record (VBR)
 * @param {Object} options
 * @return {VBR}
 */
function VBR( options ) {
  
  if( !(this instanceof VBR) )
    return new VBR( options )
  
  this.jmp = new Buffer([ 0xEB, 0x58, 0x90 ])
  // 0x20 padded OEM/System name (0x03-0x0B)
  this.oemName = 'MSDOS5.0'
  
  this.bytesPerSector = 0x0000
  this.sectorsPerCluster = 0x00
  this.reservedSectors = 0x0000
  this.numberOfFATs = 0x00
  this.rootDirEntries = 0x0000
  this.numberOfSectors16 = 0x0000
  this.mediaType = 0x00
  // Logical sectors per file allocation table
  // of FAT16 formatted partitions
  this.sectorsPerFAT16 = 0x0000
  this.sectorsPerTrack = 0x0000
  this.numberOfHeads = 0x0000
  this.hiddenSectors = 0x00000000
  this.numberOfSectors32 = 0x00000000
  
  // Logical sectors per file allocation table
  // of FAT32 formatted partitions
  this.sectorsPerFAT32 = 0x00000000
  this.extFlags = 0x00
  this.version = {
    major: 0x00,
    minor: 0x00,
  }
  
  // Cluster number of root directory start,
  // typically 2 (first cluster)
  this.rootCluster = 0x00000000
  // Logical sector number of FS Information Sector, typically 1
  this.fsInfoSector = 0x0000
  // First logical sector number of a copy of
  // the three FAT32 boot sectors, typically 6.
  this.mirrorSector = 0x0000
  
  // Reserved (may be changed to format filler byte
  // 0xF6 as an artefact by MS-DOS FDISK)
  // this.reserved = new Buffer( 12 )
  
  // Physical drive number
  // (only in DOS 3.2 to 3.31 boot sectors)
  this.driveNumber = 0x00
  // this.reserved = 0x00
  
  // Should be 0x29 to indicate that an EBPB
  // with the following 3 entries exists 
  this.extendedSignature = 0x00
  this.volumeId = 0x00000000
  this.volumeLabel = 'NO NAME'
  this.fsType = 'FAT32'
  
  this.code = new Buffer( 0x1FD - 92 )
  this.code.fill( 0 )
  
  // Boot sector signature (0x55 0xAA)
  this.signature = 0xAA55
  
}

VBR.MAGIC = 0xAA55

VBR.parse = function( buffer ) {
  return new VBR().parse( buffer )
}

/**
 * VBR Prototype
 * @type {Object}
 */
VBR.prototype = {
  
  constructor: VBR,
  
  parse: function( buffer ) {
    
    this.jmp = buffer.slice( 0, 3 )
    this.oemName = buffer
      .toString( 'ascii', 3, 11 )
      .replace( /\s|\x00/g, '' )
    
    this.bytesPerSector = buffer.readUInt16LE( 11 )
    this.sectorsPerCluster = buffer.readUInt8( 13 )
    this.reservedSectors = buffer.readUInt16LE( 14 )
    this.numberOfFATs = buffer.readUInt8( 16 )
    this.rootDirEntries = buffer.readUInt16LE( 17 )
    this.numberOfSectors16 = buffer.readUInt16LE( 19 )
    this.mediaType = buffer.readUInt8( 21 )
    this.sectorsPerFAT16 = buffer.readUInt16LE( 22 )
    this.sectorsPerTrack = buffer.readUInt16LE( 24 )
    this.numberOfHeads = buffer.readUInt16LE( 26 )
    this.hiddenSectors = buffer.readUInt32LE( 28 )
    this.numberOfSectors32 = buffer.readUInt32LE( 32 )
    
    this.sectorsPerFAT32 = buffer.readUInt32LE( 36 )
    this.extFlags = buffer.readUInt16LE( 40 )
    
    this.version = {
      major: buffer.readUInt8( 42 ),
      minor: buffer.readUInt8( 43 )
    }
    
    this.rootCluster = buffer.readUInt32LE( 44 )
    this.fsInfoSector = buffer.readUInt16LE( 48 )
    this.mirrorSector = buffer.readUInt16LE( 50 )
    // this.reserved = buffer.slice( 52, 52 + 12 )
    
    this.driveNumber = buffer.readUInt8( 64 )
    // this.reserved = buffer.readUInt8( 65 )
    this.extendedSignature = buffer.readUInt8( 66 )
    
    this.volumeId = buffer.readUInt32LE( 67 )
    this.volumeLabel = buffer
      .toString( 'ascii', 71, 82 )
      .replace( /\s|\x00/g, '' )
    
    this.fsType = buffer
      .toString( 'ascii', 82, 90 )
      .replace( /\s|\x00/g, '' )
    
    this.code = buffer.slice( 92, 0x1FD )
    
    this.signature = buffer.readUInt16LE( 0x1FE )
    
    return this
    
  }
  
}

// Exports
module.exports = VBR
