var FAT = require( '../fat32' )

/**
 * Volume
 * @constructor
 * @memberOf FAT
 * @param {Object} [options]
 * @param {Object} [options.bits=32] - Address bits (12, 16, or 32)
 * @returns {Volume}
 */
function Volume( options ) {

  if( !(this instanceof Volume) ) {
    return new Volume( options )
  }

  options = Object.assign( {}, Volume.defaults, options )

  this.device = null
  this.bits = +options.bits
  this.readOnly = !!options.readOnly

  this.vbr = new FAT.VBR()
  this.info = new Volume.FSInfo()
  this.tables = []

}

/**
 * Volume default options
 * @type {Object}
 */
Volume.defaults = {
  bits: 32,
  readOnly: true,
}

// Volume Boot Record
Volume.BootRecord = require( './boot-record' )
// Volume File System Info
Volume.FSInfo = require( './fsinfo' )

Volume.getAddressBits = function( fsType ) {
  switch( fsType ) {
    case 'FAT12   ': return 12; break
    case 'FAT16   ': return 16; break
    case 'FAT32   ': return 32; break
    default: return 32; break
  }
}

/**
 * Volume prototype
 * @ignore
 */
Volume.prototype = {

  constructor: Volume,

  /**
   * Mount a given device
   * @param {BlockDevice} device
   * @param {Object} options
   * @param {Function} callback
   * @returns {undefined}
   */
  mount( device, options, callback ) {

    // TODO: Improve error message
    if( this.device != null ) {
      return callback.call( this, new Error( 'Already mounted' ) )
    }

    this.device = device
    this.tables = []

    var tasks = [
      ( next ) => this.readVBR( 0, next ),
      ( next ) => {
        // For FAT12 & FAT16 there's no FSInfo sector
        if( this.vbr.fsInfoSector === 0 ) return next()
        this.readFSInfo( this.vbr.fsInfoSector, next )
      },
      ( next ) => {
        for( var i = 0; i < this.vbr.numberOfFATs; i++ ) {
          tasks.push( ( next ) => this.readFAT( this.tables.length, next ) )
        }
        next()
      },
    ]

    var run = ( error ) => {
      if( error ) return callback.call( this, error )
      var task = tasks.shift()
      task ? task( run ) : callback.call( this )
    }

    run()

  },

  /**
   * Unmount the volume from the currently mounted device
   * @param {Function} callback
   * @returns {undefined}
   */
  unmount( callback ) {
    // TODO: Flush & wait for ongoing ops
    this.device = null
    callback.call( this )
  },

  /**
   * Read & parse the VBR from a given address
   * @param {Number} lba
   * @param {Function} callback
   * @returns {undefined}
   */
  readVBR( lba, callback ) {
    this.device.readBlocks( lba, lba + 1, null, ( error, buffer, bytesRead ) => {
      if( error ) return callback.call( this, error )
      try { this.vbr.parse( buffer ) }
      catch( err ) { error = err }
      this.bits = Volume.getAddressBits( this.vbr.fsType )
      callback.call( this, error, this.vbr )
    })
  },

  /**
   * Read & parse the FSInfo from a given address
   * @param {Number} lba
   * @param {Function} callback
   * @returns {undefined}
   */
  readFSInfo( lba, callback ) {
    this.device.readBlocks( lba, lba + 1, null, ( error, buffer, bytesRead ) => {
      if( error ) return callback.call( this, error )
      try { this.info.parse( buffer ) }
      catch( err ) { error = err }
      callback.call( this, error, this.info )
    })
  },

  readFAT( number, callback ) {

    var lba = this.vbr.reservedSectors *
      this.vbr.bytesPerSector /
      this.device.blockSize

    var blocks = this.vbr.sectorsPerFAT *
      this.vbr.bytesPerSector /
      this.device.blockSize

    var offset = number * blocks
    var from = lba + offset
    var to = lba + offset + blocks

    this.device.readBlocks( from, to, null, ( error, buffer, bytesRead ) => {
      this.tables[number] = {
        id: buffer.readUIntLE( 0, this.bits / 8 ),
        eoc: buffer.readUIntLE( 1, this.bits / 8 ),
        buffer: buffer,
      }
      callback.call( this, error, buffer )
    })

  },

}

// Exports
module.exports = Volume
