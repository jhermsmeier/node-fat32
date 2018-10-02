var FAT = require( './fat32' )

/**
 * Cluster
 * @constructor
 * @memberOf FAT
 * @returns {Cluster}
 */
function Cluster() {

  if( !(this instanceof Cluster) ) {
    return new Cluster()
  }

  this.type = FAT.CLUSTER.FREE
  // this.number = 0
  this.flags = 0
  this.value = 0

}

Cluster.type = function clusterType( value, bits ) {
  switch( bits ) {
    case 32: return Cluster.type32( value )
    case 16: return Cluster.type16( value )
    case 12: return Cluster.type12( value )
  }
}

Cluster.from = function( value, bits ) {
  return new Cluster().set( value, bits )
}

/**
 * Cluster prototype
 * @ignore
 */
Cluster.prototype = {

  constructor: Cluster,

  /**
   * Get the FAT value of this cluster
   * @param {Number} [bits=32]
   * @return {Number}
   */
  getValue( bits ) {
    var shift = ( bits || 32 ) - 4
    return this.type | ( this.flags << shift ) | this.next
  },

  /**
   * Set a cluster's properties from a FAT cluster value
   * @param {Number} value
   * @param {Number} [bits=32]
   * @return {Cluster}
   */
  set( value, bits ) {

    var shift = ( bits || 32 ) - 4

    this.type = Cluster.type( value, bits )
    // this.number = clusterNumber
    // First 4 cluster bits are the flags
    this.flags = value >>> shift
    // (2^bits - 1) => value bitmask
    // (0xFF, 0x0FFF, and 0x0FFFFFFF)
    this.next = value & (( 1 << shift ) - 1 )

    return this

  },

}

Cluster.type12 = function( value ) {

  value = value & 0x0FFF

  if( value === 0x0000 ) {
    return FAT.CLUSTER.FREE
  } else if( value === 0x0001 ) {
    return FAT.CLUSTER.INTERNAL
  } else if( value >= 0x0002 && value <= 0x0FEF ) {
    return FAT.CLUSTER.DATA
  } else if( value >= 0x0FF0 && value <= 0x0FF5 ) {
    return FAT.CLUSTER.RESERVED_CONTEXT
  } else if( value === 0x0FF6 ) {
    return FAT.CLUSTER.RESERVED
  } else if( value === 0x0FF7 ) {
    return FAT.CLUSTER.BAD
  } else if( value >= 0x0FF8 && value <= 0x0FFF ) {
    return FAT.CLUSTER.EOC
  } else {
    return FAT.CLUSTER.UNKNOWN
  }

}

Cluster.type16 = function( value ) {

  // value = value & 0x0FFF

  if( value === 0x0000 ) {
    return FAT.CLUSTER.FREE
  } else if( value === 0x0001 ) {
    return FAT.CLUSTER.INTERNAL
  } else if( value >= 0x0002 && value <= 0xFFEF ) {
    return FAT.CLUSTER.DATA
  } else if( value >= 0xFFF0 && value <= 0xFFF5 ) {
    return FAT.CLUSTER.RESERVED_CONTEXT
  } else if( value === 0xFFF6 ) {
    return FAT.CLUSTER.RESERVED
  } else if( value === 0xFFF7 ) {
    return FAT.CLUSTER.BAD
  } else if( value >= 0xFFF8 && value <= 0xFFFF ) {
    return FAT.CLUSTER.EOC
  } else {
    return FAT.CLUSTER.UNKNOWN
  }

}

Cluster.type32 = function( value ) {

  // value = value & 0x0FFFFFFF

  if( value === 0x00000000 ) {
    return FAT.CLUSTER.FREE
  } else if( value === 0x00000001 ) {
    return FAT.CLUSTER.INTERNAL
  } else if( value >= 0x00000002 && value <= 0x0FFFFFEF ) {
    return FAT.CLUSTER.DATA
  } else if( value >= 0x0FFFFFF0 && value <= 0x0FFFFFF5 ) {
    return FAT.CLUSTER.RESERVED_CONTEXT
  } else if( value === 0x0FFFFFF6 ) {
    return FAT.CLUSTER.RESERVED
  } else if( value === 0x0FFFFFF7 ) {
    return FAT.CLUSTER.BAD
  } else if( value >= 0x0FFFFFF8 && value <= 0x0FFFFFFF ) {
    return FAT.CLUSTER.EOC
  } else {
    return FAT.CLUSTER.UNKNOWN
  }

}

// Exports
module.exports = Cluster
