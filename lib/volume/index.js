var FAT32 = require( '../fat32' )

/**
 * Volume Constructor
 * @param {Object} partition
 * @param {Object} options
 * @return {Volume}
 */
function Volume( partition, options ) {

  if( !(this instanceof Volume) )
    return new Volume( options )

  this.partition = partition

  this.vbr = new Volume.BootRecord()
  this.fsInfo = new Volume.FSInfo()
  this.allocTable = new FAT32.AllocationTable( this )

}

/**
 * Volume Boot Record (VBR)
 * @type {Function}
 */
Volume.BootRecord = require( './boot-record' )

/**
 * Volume File System Info
 * @type {Function}
 */
Volume.FSInfo = require( './fsinfo' )

/**
 * Volume Prototype
 * @type {Object}
 */
Volume.prototype = {

  constructor: Volume,

  get clusterSize() {
    return this.vbr.bytesPerSector *
      this.vbr.sectorsPerCluster
  },

  readVBR: function( lba, callback ) {

    var self = this
    var done = callback.bind( this )

    this.partition.readBlocks( lba, lba + 1, null,
      function( error, buffer, bytesRead ) {
        if( error != null ) { return done( error ) }
        try { self.vbr.parse( buffer ) }
        catch( err ) { error = err }
        done( error )
      }
    )

  },

  readFSI: function( lba, callback ) {

    var self = this
    var done = callback.bind( this )

    this.partition.readBlocks( lba, lba + 1, null,
      function( error, buffer, bytesRead ) {
        if( error != null ) { return done( error ) }
        try { self.fsInfo.parse( buffer ) }
        catch( err ) { error = err }
        done( error )
      }
    )

  },

  readFAT: function( callback ) {

    var self = this
    var done = callback.bind( this )

    // NOTE: Only reading one FAT for now
    this.partition.readBlocks(
      self.vbr.reservedSectors,
      // self.vbr.reservedSectors + ( self.vbr.numberOfFATs * self.vbr.sectorsPerFAT32 ),
      self.vbr.reservedSectors + ( self.vbr.sectorsPerFAT32 ),
      null,
      function( error, buffer, bytesRead ) {
        if( error != null ) { return done( error ) }
        self.allocTable = new FAT32.AllocationTable( self )
        buffer.copy( self.allocTable )
        self.rootChain = self.allocTable.getClusterChain( self.vbr.rootCluster ) // self.vbr.rootCluster
        self.readChain( self.rootChain, function( error, buffer, bytesRead ) {
          if( error != null ) { return done( error ) }
          self.rootDirectoryLength = buffer.length
          self.rootDirectory = new FAT32.Directory()
          self.rootDirectory.parse( buffer )
          // self.rootDirectory = buffer
          done( error )
        })
      }
    )

  },

  readChain: function( chain, callback ) {

    var self = this
    var done = callback.bind( this )

    var clusters = chain.map( function( cluster ) {
      return cluster.address
    })

    var firstCluster = clusters[0]
    var lastCluster = clusters[ clusters.length - 1 ] + 1
    var numberOfClusters = lastCluster - firstCluster

    var dataRegionOffset = this.vbr.reservedSectors +
      this.vbr.numberOfFATs *
      this.vbr.sectorsPerFAT32

    var firstLBA = dataRegionOffset +
      firstCluster * this.vbr.sectorsPerCluster
    var lastLBA = dataRegionOffset +
      lastCluster * this.vbr.sectorsPerCluster

    console.log( 'READ:CHAIN', {
      firstCluster: firstCluster,
      lastCluster: lastCluster,
      numberOfClusters: numberOfClusters,
      firstLBA: firstLBA,
      lastLBA: lastLBA,
    })

    this.partition.readBlocks(
      firstLBA, lastLBA, null, done
    )

  },

  mount: function( callback ) {

    var self = this
    var done = callback.bind( this )

    this.readVBR( 0, function( error ) {
      if( error != null ) { return done( error ) }
      self.readFSI( self.vbr.fsInfoSector, function( error ) {
        if( error != null ) { return done( error ) }
        self.readFAT( done )
      })
    })

  },

}

// Exports
module.exports = Volume
