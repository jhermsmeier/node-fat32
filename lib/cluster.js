/**
 * Cluster Constructor
 * @return {Cluster}
 */
function Cluster( number, value ) {

  if( !(this instanceof Cluster) )
    return new Cluster( value )

  this.flags = ( '0000' + ( value >>> ( 32 - 4 ) ).toString( 2 ) ).substr( -4 )
  this.number = number
  this.address = number - 2
  this.value = '0x'+('00000000'+value.toString(16).toUpperCase()).substr( -8 )
  this.next = value & 0x0FFFFFFF
  this.type = Cluster.getType( this.next )

}

Cluster.getType = function( value ) {
  if( value === 0x0000000 ) {
    return 'FREE'
  } else if( value === 0x0000001 ) {
    return 'INTERNAL'
  } else if( value >= 0x0000002 && value <= 0xFFFFFEF ) {
    return 'DATA'
  } else if( value >= 0xFFFFFF0 && value <= 0xFFFFFF5 ) {
    return 'RESERVED CONTEXT'
  } else if( value === 0xFFFFFF6 ) {
    return 'RESERVED'
  } else if( value === 0xFFFFFF7 ) {
    return 'BAD'
  } else if( value >= 0xFFFFFF8 && value <= 0xFFFFFFF ) {
    return 'EOC'
  } else {
    return 'UNKNOWN'
  }
}

/**
 * Cluster Prototype
 * @type {Object}
 */
Cluster.prototype = {

  constructor: Cluster,

}

// Exports
module.exports = Cluster
