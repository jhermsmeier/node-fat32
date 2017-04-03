var FAT32 = module.exports

// FAT32 Long File Name (LFN)
FAT32.LFN = require( './lfn' )
// FAT32 Directory Table
FAT32.Directory = require( './directory' )
// FAT32 Allocation Table
FAT32.AllocationTable = require( './alloc-table' )
// FAT Volume Boot Record
FAT32.VBR = require( './volume/boot-record' )
// FAT32 Volume
FAT32.Volume = require( './volume' )
// FAT32 File System API
FAT32.FileSystem = require( './file-system' )

/**
 * Determines if a given bootsector
 * indicates a FAT32 formatted volume
 * @param  {Buffer}  bootSector
 * @return {Boolean}
 */
FAT32.test = function( bootSector ) {
  throw new Error( 'Not implemented' )
}

/**
 * Format a given partition as FAT32
 * @param  {Partition}    partition
 * @param  {Object}       options
 * @param  {Function}     callback
 * @return {FAT32.Volume}
 */
FAT32.format = function( partition, options, callback ) {
  throw new Error( 'Not implemented' )
}
