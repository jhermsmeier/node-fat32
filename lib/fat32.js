var FAT32 = module.exports

// Volume Boot Record (VBR)
FAT32.VBR = require( './vbr' )
// FS Information Sector
FAT32.FSInfo = require( './fsinfo' )

// FAT32 Volume Constructor
FAT32.Volume = require( './volume' )

/**
 * Determines if a given bootsector
 * indicates a FAT32 formatted volume
 * @param  {Buffer}  bootSector
 * @return {Boolean}
 */
FAT32.test = function( bootSector ) {
  throw new Error( 'Not implemented' )
}
