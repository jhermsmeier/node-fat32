var FAT = require( '../fat32' )

class Directory {

  constructor() {
    this.entries = []
  }

  parse( buffer, offset ) {

    offset = offset || 0

    var entrySize = 32
    var lfn = new FAT.LFN()

    while( offset < buffer.length ) {
      // var slice = buffer.slice( offset, offset += entrySize )
      var attr = buffer.readUInt8( offset + 11 )
      // VFAT LFNs have the Volume Label,
      // System, Hidden, and Read Only flags set,
      // yielding 0x0F as DOS attributes
      // TODO: Check for cluster being 0x0000 as well
      if( attr === 0x0F ) {
        lfn.parseEntry( buffer, offset )
      } else if( buffer[ offset ] !== 0x00 ) {
        var entry = new Directory.Entry()
        entry.parse( buffer, offset )
        entry.lfn = lfn
        entry.longFileName = lfn.getFileName()
        lfn = new FAT.LFN()
        // if( entry.fileSize > 0 || entry.attr !== 0 )
          this.entries.push( entry )
      }
      offset += entrySize
    }

    return this

  }

  write( buffer, offset ) {

    var length = this.entries.length * Directory.Entry.SIZE

    offset = offset || 0
    buffer = buffer || Buffer.alloc( offset + length )

    throw new Error( 'Not implemented' )

    return buffer

  }

}

/**
 * Directory Entry Constructor
 * @type {Function}
 */
Directory.Entry = require( './entry' )

// Exports
module.exports = Directory
