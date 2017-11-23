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
    case 32: return clusterType32( value )
    case 16: return clusterType16( value )
    case 12: return clusterType12( value )
  }
}

Cluster.from = function( value, bits ) {

  var shift = ( bits || 32 ) - 4
  var cluster = new Cluster()

  cluster.type = Cluster.type( value, bits )
  // cluster.number = clusterNumber
  // First 4 cluster bits are the flags
  cluster.flags = value >>> shift
  // (2^bits - 1) => value bitmask
  // (0xFF, 0x0FFF, and 0x0FFFFFFF)
  cluster.next = value & (( 1 << shift ) - 1 )

  return cluster

}

/**
 * Cluster prototype
 * @ignore
 */
Cluster.prototype = {

  constructor: Cluster,

}

function clusterType12( value ) {

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

function clusterType16( value ) {

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

function clusterType32( value ) {

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
