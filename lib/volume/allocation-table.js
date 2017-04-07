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
    var bits = this.bits !== 12 ? this.bits : 24
    var offset = (( position * this.bits ) / 8 ) | 0
    var value = this.tables[table].readUIntLE( offset, bits / 8 )

    // console.log( 'bits:', bits, 'offset:', offset )
    // console.log( 'value:', '0x' + value.toString(16).toUpperCase() )

    // For FAT12, alternate between upper & lower 12 bits,
    // depending on position being read
    if( this.bits === 12 ) {
      value = position % 2 ?
        ( value & 0xFFF000 ) >> 12 :
        ( value & 0x000FFF )
      // console.log( 'value:', '0x' + value.toString(16).toUpperCase() )
    }

    return value

  },

  getCluster( clusterNumber, table ) {
    return this.read( clusterNumber )
  },

  getClusterChain( clusterNumber, table ) {
    // ...
  },

}

// Exports
module.exports = AllocationTable
