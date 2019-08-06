var FAT32 = module.exports

/**
 * Cluster types
 * @enum {Number}
 */
FAT32.CLUSTER = {
  FREE: 0, // 0,
  RESERVED_CONTEXT: 1 << 1, // 2
  RESERVED: 1 << 2, // 4
  INTERNAL: 1 << 3, // 8
  DATA: 1 << 4, // 16
  BAD: 1 << 5, // 32
  EOC: 1 << 6, // 64
  UNKNOWN: 1 << 7, // 128
}

FAT32.Cluster = require( './cluster' )
// FAT32 Long File Name (LFN)
FAT32.LFN = require( './lfn' )
// FAT32 Directory Table
FAT32.Directory = require( './directory' )
// FAT Volume Boot Record
FAT32.VBR = require( './volume/boot-record' )
// FAT32 Volume
FAT32.Volume = require( './volume' )
// FAT32 File System API
FAT32.FileSystem = require( './filesystem' )

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
