var FAT32 = require( './fat32' )

/**
 * Volume Constructor
 * @param {Object} options
 * @return {Volume}
 */
function Volume( options ) {
  
  if( !(this instanceof Volume) )
    return new Volume( options )
  
  this.vbr = FAT32.VBR()
  this.fsis = FAT32.FSInfo()
  
}

/**
 * Volume Prototype
 * @type {Object}
 */
Volume.prototype = {
  
  constructor: Volume,
  
}

// Exports
module.exports = Volume
