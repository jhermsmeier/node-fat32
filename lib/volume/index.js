var FAT = require( '../fat32' )

/**
 * Volume
 * @constructor
 * @memberOf FAT
 * @param {Object} [options]
 * @param {Object} [options.bits=32] - Address bits (12, 16, or 32)
 * @returns {FAT.Volume}
 */
function Volume( options ) {

  if( !(this instanceof Volume) ) {
    return new Volume( options )
  }

  options = options || {}

  /** @type {BlockDevice} Block device */
  this.device = null
  /** @type {Number} Address bits */
  this.bits = options.bits || Volume.defaults.bits
  /** @type {Boolean} Whether to treat the volume as read only */
  this.readOnly = options.readOnly != null ?
    !!options.readOnly : Volume.defaults.readOnly

  /** @type {FAT.VBR} Volume Boot Record */
  this.vbr = new FAT.VBR()
  /** @type {FAT.Volume.FSInfo} FSInfo Record */
  this.info = new Volume.FSInfo()
  /** @type {FAT.Volume.AllocationTable} Allocation table(s) */
  this.fat = new Volume.AllocationTable()

  switch( this.bits ) {
    case 12: case 16: case 32: break;
    default: throw new Error( `Invalid address bits: ${this.bits}` )
  }

}

/**
 * Volume default options
 * @type {Object}
 * @constant
 */
Volume.defaults = {
  bits: 32,
  readOnly: true,
}

// Volume Boot Record
Volume.BootRecord = require( './boot-record' )
// Volume File System Info
Volume.FSInfo = require( './fsinfo' )
// File Allocation Table
Volume.AllocationTable = require( './allocation-table' )

/**
 * Determine address bits by fs type
 * @param {String} fsType
 * @returns {Number} bits
 */
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
    this.fat.tables = []

    var tasks = [
      ( next ) => this.readVBR( 0, next ),
      ( next ) => {
        // For FAT12 & FAT16 there's no FSInfo sector
        // TODO: Clear FSInfo in this case
        if( this.vbr.fsInfoSector === 0 ) return next()
        this.readFSInfo( this.vbr.fsInfoSector, next )
      },
      ( next ) => {
        for( var i = 0; i < this.vbr.numberOfFATs; i++ ) {
          tasks.push( ( next ) => this.readFAT( this.fat.tables.length, next ) )
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
   * Create a FAT file system on a given device
   * @param {BlockDevice} device
   * @param {Object} options
   * @param {Function} callback
   * @returns {undefined}
   */
  create( device, options, callback ) {

    options.type = 'FAT32'
    options.name = '           '
    options.firstLBA
    options.lastLBA
    options.numberOfFATs = 2
    options.sectorSize = 4096
    options.sectorsPerCluster = 1

    throw new Error( 'Not implemented' )

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

      try {
        this.vbr.parse( buffer )
      } catch( err ) {
        error = err
      }

      // this.bits = Volume.getAddressBits( this.vbr.fsType )
      this.fat.bits = this.bits

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

      try {
        this.info.parse( buffer )
      } catch( err ) {
        error = err
      }

      callback.call( this, error, this.info )

    })
  },

  /**
   * Read the given FAT from the device
   * @param {Number} Allocation table number
   * @param {Function} callback(error, buffer)
   * @returns {undefined}
   */
  readFAT( number, callback ) {

    var lba = this.vbr.reservedSectors *
      this.vbr.sectorSize /
      this.device.blockSize

    var blocks = this.vbr.sectorsPerFAT *
      this.vbr.sectorSize /
      this.device.blockSize

    var offset = number * blocks
    var from = lba + offset
    var to = lba + offset + blocks

    this.device.readBlocks( from, to, null, ( error, buffer, bytesRead ) => {
      this.fat.tables[number] = buffer
      callback.call( this, error, buffer )
    })

  },

}

// Exports
module.exports = Volume
