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
  /** @type {Number} Allocation pointer (last allocated cluster number) */
  this.allocPointer = 0
  // TODO: Parse endianness marker (first cluster in FAT),
  // and act accordingly

}

/**
 * AllocationTable prototype
 * @ignore
 */
AllocationTable.prototype = {

  constructor: AllocationTable,

  get fatId() {
    return this.read( 0 )
  },

  get eoc() {
    return this.read( 1 )
  },

  get fatIds() {
    var fatIds = []
    for( var i = 0; i < this.tables.length; i++ ) {
      fatIds.push( this.read( 0, i ) )
    }
    return fatIds
  },

  get eocs() {
    var eocs = []
    for( var i = 0; i < this.tables.length; i++ ) {
      eocs.push( this.read( 1, i ) )
    }
    return eocs
  },

  getUsage( tableIndex ) {

    tableIndex = tableIndex || 0

    var clusterCount = ( this.tables[0].length / ( this.bits / 8 ) )
    var stats = { total: clusterCount, used: 0, free: 0 }

    for( var i = 0; i < clusterCount; i++ ) {
      if( this.read( i, tableIndex ) === 0 ) {
        stats.free++
      } else {
        stats.used++
      }
    }

    return stats

  },

  /**
   * Get a FAT.Cluster for a given cluster number
   * @param {Number} clusterNumber
   * @param {Number} tableIndex
   * @returns {FAT.Cluster} cluster
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
   * Allocate a new cluster to a cluster chain
   * @param  {Number} tailCluster - Tail cluster value
   * @return {Boolean} Whether a cluster could be allocated
   */
  allocCluster( tailCluster ) {

    // Number of usable clusters (minus two to skip reserved FAT ID and EOC clusters)
    var total = ( this.tables[0].length / ( this.bits / 8 ) ) - 2
    var cluster = new Cluster()
    var clusterNumber = 0

    for( var i = 0; i < total; i++ ) {

      // Ensure
      clusterNumber = this.allocPointer + 2

      this.allocPointer = ( this.allocPointer + 1 ) % total

      // Never use this cluster number in a FAT12 fs
      if( this.bits === 12 && clusterNumber === 0xFF0 ) {
        continue
      }

      // Read cluster
      cluster.set( this.read( clusterNumber, 0 ), this.bits )

      if( cluster.type === FAT.CLUSTER.FREE ) {
        // TODO: Update tail (from EOC -> DATA), write EOC to new cluster
        this.write( tailCluster.getValue( this.bits ), clusterNumber, 0 )
        return true
      }

    }

    return false

  },

  /**
   * Allocate a new cluster chain
   * @param {Number} clusterCount
   * @param {Number} [tableIndex=0] - Allocation table to use
   * @returns {Number} Value of first allocated cluster in chain
   */
  allocClusterChain( clusterCount, tableIndex ) {

    for( var i = 0; i < clusterCount; i++ ) {
      // TODO: Implement
      this.allocCluster(  )
    }

  },

  /**
   * Free a cluster chain starting at a given cluster number
   * @param {Number} clusterNumber
   * @param {Number} [tableIndex=0]
   * @returns {Number} number of freed clusters
   */
  freeClusterChain( clusterNumber, tableIndex ) {

    tableIndex = tableIndex || 0

    var cluster = new Cluster()
    var count = 0

    cluster.set( this.read( clusterNumber, tableIndex ), this.bits )

    while( cluster.type !== FAT.CLUSTER.EOC ) {
      this.write( 0, clusterNumber, tableIndex )
      clusterNumber = cluster.next
      cluster.set( this.read( clusterNumber, tableIndex ), this.bits )
      count++
    }

    return count

  },

  /**
   * Read a cluster value from a table
   * @param {Number} position - Cluster number to read
   * @param {Number} [tableIndex=0] - Table to read from
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
   * @param {Number} position - Cluster number to write to
   * @param {Number} [tableIndex=0] - Table to write to
   * @returns {Number} value
   */
  write( value, position, tableIndex ) {

    tableIndex = tableIndex || 0

    var bits = this.bits !== 12 ?
      this.bits : 24

    var offset = this.bits !== 12 ?
      ( position * this.bits / 8 ) :
      ( Math.floor( position / 2 ) * bits / 8 )

    // For FAT12, read the 24 bit slot, in order to write the 12 bit part back
    if( this.bits === 12 ) {
      var current = this.tables[tableIndex].readUIntLE( offset, bits / 8 )
      value = position % 2 === 0 ?
        ( value << 12 | ( current & 0x000FFF ) ) :
        ( value | ( current & 0xFFF000 ) )
    }

    this.tables[tableIndex].writeUIntLE( value, offset, bits / 8 )

    return value

  }

}

// Exports
module.exports = AllocationTable
