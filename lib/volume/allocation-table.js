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

  this.bits = 32
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

  read( position, table ) {

    table = table || 0

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

    var value = this.tables[table].readUIntLE( offset, bits / 8 )

    // For FAT12, alternate between upper & lower 12 bits,
    // depending on position being read
    if( this.bits === 12 ) {
      value = position % 2 === 0 ?
        ( value & 0x000FFF ) :
        ( value >>> 12 )
    }

    return value

  },

  getCluster( clusterNumber, table ) {
    var value = this.read( clusterNumber, table )
    return FAT.Cluster.from( value, this.bits )
  },

  getClusterChain( clusterNumber, table ) {

    var cluster = this.getCluster( clusterNumber, table )
    var chain = [ cluster ]

    while( cluster.type === FAT.CLUSTER.DATA ) {
      cluster = this.getCluster( cluster.next, table )
      chain.push( cluster )
    }

    return chain

  },

}

// Exports
module.exports = AllocationTable
