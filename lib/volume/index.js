var FAT = require( '../fat32' )
var async = require( '../async' )
var FileDevice = require( './file-device' )

class Volume {

  constructor( options ) {

    /** @type {BlockDevice} Block device */
    this.device = options.device || new FileDevice( options )
    /** @type {Number} Device block size */
    this.blockSize = options.blockSize || Volume.defaults.blockSize
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

    this.fs = new FAT.FileSystem( this )

    switch( this.bits ) {
      case 12: case 16: case 32: break;
      default: throw new Error( `Invalid address bits: ${this.bits}` )
    }

  }

  open( callback ) {

    async.series([
      ( next ) => this.device.open( next ),
      ( next ) => this.readVBR( 0, next ),
      ( next ) => {
        // For FAT12 & FAT16 there's no FSInfo sector
        // TODO: Clear FSInfo in this case
        if( this.vbr.fsInfoSector === 0 ) {
          return next()
        }
        this.readFSInfo( this.vbr.fsInfoSector, next )
      },
      ( next ) => {
        var tablesRead = 0
        var onDone = ( error ) => {
          if( error || ++tablesRead === this.vbr.numberOfFATs ) {
            next( error )
          }
        }
        for( var i = 0; i < this.vbr.numberOfFATs; i++ ) {
          this.readFAT( i, onDone )
        }
      },
      // ( next ) => this.readDir( this.vbr.rootDirCluster, next ),
    ], ( error ) => {
      callback.call( this )
    })

  }

  /**
   * Read & parse the VBR from a given address
   * @param {Number} lba
   * @param {Function} callback
   * @returns {undefined}
   */
  readVBR( lba, callback ) {

    var position = lba * this.blockSize
    var length = FAT.VBR.SIZE
    var buffer = Buffer.alloc( length )

    this.device.read( buffer, 0, length, position, ( error, bytesRead, buffer ) => {

      if( error ) {
        return void callback.call( this, error )
      }

      try {
        this.vbr.parse( buffer )
        this.blockSize = this.vbr.sectorSize
      } catch( err ) {
        error = err
      }

      // this.bits = Volume.getAddressBits( this.vbr.fsType )
      this.fat.bits = this.bits

      // TODO: Determine bits by Microsoft's EFI FAT32 specification,
      // which states that any FAT file system with less than 4085 clusters is FAT12,
      // else any FAT file system with less than 65525 clusters is FAT16,
      // and otherwise it is FAT32.
      // (see https://en.wikipedia.org/wiki/Design_of_the_FAT_file_system#Size_limits)

      callback.call( this, error, this.vbr )

    })

  }

  /**
   * Read & parse the FSInfo from a given address
   * @param {Number} lba
   * @param {Function} callback
   * @returns {undefined}
   */
  readFSInfo( lba, callback ) {

    var position = lba * this.blockSize
    var length = Volume.FSInfo.SIZE
    var buffer = Buffer.alloc( length )

    this.device.read( buffer, 0, length, position, ( error, bytesRead, buffer ) => {

      if( error ) {
        return void callback.call( this, error )
      }

      try {
        this.info.parse( buffer )
      } catch( err ) {
        error = err
      }

      callback.call( this, error, this.info )

    })

  }

  /**
   * Read the given FAT from the device
   * @param {Number} Allocation table number
   * @param {Function} callback(error, buffer)
   * @returns {undefined}
   */
  readFAT( number, callback ) {

    var lba = this.vbr.reservedSectors *
      this.vbr.sectorSize /
      this.blockSize

    var blocks = this.vbr.sectorsPerFAT *
      this.vbr.sectorSize /
      this.blockSize

    var offset = number * blocks
    var start = lba + offset

    var position = start * this.blockSize
    var length = blocks * this.blockSize
    var buffer = Buffer.alloc( length )

    this.device.read( buffer, 0, length, position, ( error, bytesRead, buffer ) => {
      this.fat.tables[ number ] = buffer
      callback.call( this, error, buffer )
    })

  }

  readCluster( clusterNumber, callback ) {

    var position = 0
    var length = 0
    var buffer = Buffer.allocUnsafe( length )
    var offset = 0

    this.device.read( buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( error || bytesRead !== length ) {
        error = error || new Error( `Wanted ${length} bytes, read ${bytesRead}` )
        return void callback.call( this, error )
      }

      callback.call( this, error, buffer )

    })

  }

  readDir( clusterNumber, callback ) {

    var clusters = this.fat.getClusterChain( clusterNumber )
    var dirEntriesPerCluster = ( this.vbr.sectorsPerCluster * this.vbr.sectorSize ) / FAT.Directory.Entry.SIZE

    var dataRegionOffset = ( this.vbr.reservedSectors * this.vbr.sectorSize ) +
      ( this.vbr.numberOfFATs * this.vbr.sectorsPerFAT * this.vbr.sectorSize ) +
      ( this.vbr.rootDirEntries * FAT.Directory.Entry.SIZE )

    // console.log( 'dataRegionOffset', dataRegionOffset )

    var clustersRead = 0
    var directory = new FAT.Directory()

    async.whilst(() => clustersRead < clusters.length, ( next ) => {

      var cluster = clusters[ clustersRead ]
      var position = dataRegionOffset + ( ( cluster.number - this.vbr.rootDirCluster ) * this.vbr.sectorsPerCluster * this.vbr.sectorSize )
      var length = dirEntriesPerCluster * FAT.Directory.Entry.SIZE // == this.vbr.sectorsPerCluster * this.vbr.sectorSize
      var buffer = Buffer.alloc( length )

      // console.log( 'read position', position )

      this.device.read( buffer, 0, length, position, ( error, bytesRead, buffer ) => {

        if( error ) {
          return next( error )
        }

        clustersRead++

        try {
          directory.parse( buffer )
          // console.log( error || directory )
        } catch( e ) {
          error = e
        }

        next( error )

      })

    }, ( error ) => {
      callback.call( this, error, directory )
    })

  }

  close( callback ) {
    this.device.close(( error ) => {
      callback.call( this, error )
    })
  }

}

/**
 * Volume default options
 * @type {Object}
 * @constant
 */
Volume.defaults = {
  bits: 32,
  blockSize: 512,
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

module.exports = Volume
