var FAT32 = require( './fat32' )
var inherit = require( 'bloodline' )

/**
 * AllocationTable Constructor
 * @param {FAT32.Volume} volume
 * @param {Object} options
 * @return {AllocationTable}
 */
function AllocationTable( volume, options ) {

  if( !(this instanceof AllocationTable) )
    return new AllocationTable( volume, options )

  // Calculate sizeof(FAT) from VBR
  var length = volume.vbr.numberOfFATs *
    volume.vbr.sectorsPerFAT32 *
    volume.vbr.bytesPerSector

  // Init buffer to sizeof(FAT)
  Buffer.call( this, length )
  // and zerofill
  this.fill( 0 )

  this.volume = volume

}

/**
 * Allocation Table Cluster Entry
 * @type {Function}
 */
AllocationTable.Cluster = require( './cluster' )

/**
 * AllocationTable Prototype
 * @type {Object}
 */
AllocationTable.prototype = {

  constructor: AllocationTable,

  get fatId() {
    return this.readUInt32LE( 0 )
  },

  get eoc() {
    return this.readUInt32LE( 1 )
  },

  get clusterSize() {
    return this.volume.clusterSize
  },

  get lastCluster() {
    return // TODO
  },

  getCluster: function( clusterNumber ) {
    // Calculate offset of cluster entry
    // in buffer (sizeof(entry) = 4 bytes)
    var offset = ( clusterNumber ) * 4
    return new AllocationTable.Cluster(
      clusterNumber,
      this.readUInt32LE( offset )
    )
  },

  getClusterChain: function( clusterNumber ) {

    var cluster = this.getCluster( clusterNumber )
    var chain = [ cluster ]

    while( cluster.type === 'DATA' ) {
      cluster = this.getCluster( cluster.next )
      chain.push( cluster )
    }

    return chain

  },

  inspect: function() {
    return Buffer.prototype.inspect.call( this ) + ' ' +
      require( 'util' ).inspect({
        fatId: this.fatId,
        eoc: this.eoc,
        clusterSize: this.clusterSize,
      })
  }

}

// Inherit from Buffer
inherit( AllocationTable, Buffer )
// Exports
module.exports = AllocationTable
