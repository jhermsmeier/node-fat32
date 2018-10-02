var bench = require( 'nanobench' )
var FAT = require( '..' )

var ITERATIONS = 1000000

// Just a convenience to keep the FAT buffers
// readable to the human eye
function buf( str ) {
  return Buffer.from( str.replace( /[\s\n\r]+/g, '' ), 'hex' )
}

bench( `FAT12.AllocationTable.getClusterChain() ⨉ ${ITERATIONS}`, function( run ) {

  var chain = null
  var table = new FAT.Volume.AllocationTable()
  var buffer = buf(`
    F0 FF FF 03 40 00 05 60 00 07 80 00 FF AF 00 14
    C0 00 0D E0 00 0F 00 01 11 F0 FF 00 F0 FF 15 60
    01 19 70 FF F7 AF 01 FF 0F 00 00 70 FF 00 00 00
  `)

  table.bits = 12
  table.tables.push( buffer )

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    chain = table.getClusterChain(9)
  }

  run.end()

})

bench( `FAT16.AllocationTable.getClusterChain() ⨉ ${ITERATIONS}`, function( run ) {

  var chain = null
  var table = new FAT.Volume.AllocationTable()
  var buffer = buf(`
    F0 FF FF FF 03 00 04 00 05 00 06 00 07 00 08 00
    FF FF 0A 00 14 00 0C 00 0D 00 0E 00 0F 00 10 00
    11 00 FF FF 00 00 FF FF 15 00 16 00 19 00 F7 FF
    F7 FF 1A 00 FF FF 00 00 00 00 F7 FF 00 00 00 00
  `)

  table.bits = 16
  table.tables.push( buffer )

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    chain = table.getClusterChain(9)
  }

  run.end()

})

bench( `FAT32.AllocationTable.getClusterChain() ⨉ ${ITERATIONS}`, function( run ) {

  var chain = null
  var table = new FAT.Volume.AllocationTable()
  var buffer = buf(`
    F0 FF FF 0F FF FF FF 0F FF FF FF 0F 04 00 00 00
    05 00 00 00 06 00 00 00 07 00 00 00 08 00 00 00
    FF FF FF 0F 0A 00 00 00 14 00 00 00 0C 00 00 00
    0D 00 00 00 0E 00 00 00 0F 00 00 00 10 00 00 00
    11 00 00 00 FF FF FF 0F 00 00 00 00 FF FF FF 0F
    15 00 00 00 16 00 00 00 19 00 00 00 F7 FF FF 0F
    F7 FF FF 0F 1A 00 00 00 FF FF FF 0F 00 00 00 00
    00 00 00 00 F7 FF FF 0F 00 00 00 00 00 00 00 00
  `)

  table.bits = 32
  table.tables.push( buffer )

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    chain = table.getClusterChain(9)
  }

  run.end()

})
