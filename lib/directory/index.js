var FAT32 = require( '../fat32' )

/**
 * Directory Constructor
 * @return {Directory}
 */
function Directory() {
  
  if( !(this instanceof Directory) )
    return new Directory()
  
  this.entries = []
  
}

/**
 * Directory Entry Constructor
 * @type {Function}
 */
Directory.Entry = require( './entry' )

/**
 * Directory Prototype
 * @type {Object}
 */
Directory.prototype = {
  
  constructor: Directory,
  
  parse: function( buffer ) {
    
    var offset = 0
    var entrySize = 32
    var lfn = new FAT32.LFN()
    
    while( offset < buffer.length  ) {
      var slice = buffer.slice( offset, offset += entrySize )
      var attr = slice.readUInt8( 11 )
      // VFAT LFNs have the Volume Label,
      // System, Hidden, and Read Only flags set,
      // yielding 0x0F as DOS attributes
      if( attr === 0x0F ) {
        lfn.parseEntry( slice )
      } else {
        var entry = new Directory.Entry()
        entry.parse( slice )
        entry.lfn = lfn
        entry.longFileName = lfn.getFileName()
        lfn = new FAT32.LFN()
        if( entry.fileSize > 0 || entry.attr !== 0 )
          this.entries.push( entry )
      }
    }
    
    return this
    
  },
  
}

// Exports
module.exports = Directory
