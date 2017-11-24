var FAT = require( '../fat32' )

/**
 * AllocationTable
 * @constructor
 * @memberOf FAT32.Volume
 * @returns {AllocationTable}
 */
function AllocationTable() {

  if( !(this instanceof AllocationTable) ) {
    return new AllocationTable()
  }

  /** @type {Number} FAT bits */
  this.bits = 32
  /** @type {Array<Buffer>} FAT buffers */
  this.tables = []
  // TODO: Parse endianness marker (first cluster in FAT),
  // and act accordingly

}

/**
 * AllocationTable prototype
 * @ignore
 */
AllocationTable.prototype = {

  constructor: AllocationTable,

  get fatIds() {
    return this.tables.map(( fat, i ) => {
      return this.read( 0, i )
    })
  },

  get eocs() {
    return this.tables.map(( fat, i ) => {
      return this.read( 1, i )
    })
  },

  /**
   * Get a FAT.Cluster for a given cluster number
   * @param {Number} clusterNumber
   * @param {Number} tableIndex
   * @return {FAT.Cluster} cluster
   */
  getCluster( clusterNumber, tableIndex ) {
    var value = this.read( clusterNumber, tableIndex )
    return FAT.Cluster.from( value, this.bits )
  },

  /**
   * Get a cluster chain from a given cluster
   * @param {Number} clusterNumber
   * @param {Number} tableIndex
   * @returns {Array<FAT.Chain>} clusterChain
   */
  getClusterChain( clusterNumber, tableIndex ) {

    var cluster = this.getCluster( clusterNumber, tableIndex )
    var chain = [ cluster ]

    while( cluster.type === FAT.CLUSTER.DATA ) {
      cluster = this.getCluster( cluster.next, tableIndex )
      chain.push( cluster )
    }

    return chain

  },

  /**
   * Read a cluster value from a table
   * @param {Number} position - Cluster number to read
   * @param {Number} tableIndex - Table to read from
   * @returns {Number} value
   */
  read( position, tableIndex ) {

    tableIndex = tableIndex || 0

    // If we have a 12 bit FAT, read 24 bits to make
    // our lives easier, as it's divisible by 8 and
    // we can easily access the upper and lower 12 bits
    var bits = this.bits !== 12 ?
      this.bits : 24

    // For 24 bits, only bump the offset every 2 clusters
    // as we're always reading 2 clusters at once
    var offset = this.bits !== 12 ?
      ( position * this.bits / 8 ) :
      ( Math.floor( position / 2 ) * bits / 8 )

    var value = this.tables[tableIndex].readUIntLE( offset, bits / 8 )

    // For FAT12, alternate between upper & lower 12 bits,
    // depending on position being read
    if( this.bits === 12 ) {
      value = position % 2 === 0 ?
        ( value & 0x000FFF ) :
        ( value >>> 12 )
    }

    return value

  },

  /**
   * Write a cluster value to a table
   * @param {Number} value - Cluster value
   * @param {Number} position - Cluster number to read
   * @param {Number} tableIndex - Table to read from
   * @returns {Number} value
   */
  write( value, position, tableIndex ) {

    tableIndex = tableIndex || 0

    throw new Error( 'Not implemented' )

  }

}

// Exports
module.exports = AllocationTable
