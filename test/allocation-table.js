var assert = require( 'assert' )
var inspect = require( './inspect' )
var FAT = require( '../' )

// Just a convenience to keep the FAT buffers
// readable to the human eye
function buf( str ) {
  return Buffer.from( str.replace( /[\s\n\r]+/g, '' ), 'hex' )
}

// Structure of the test FAT buffers:
// - FAT ID / endianess marker (in reserved cluster #0),
//   with 0xF0 indicating a volume on a non-partitioned
//   superfloppy drive (must be 0xF8 for partitioned disks)
// - End of chain indicator / maintenance flags (in reserved cluster #1)
// - Second chain (7 clusters) for a non-fragmented file (here: #2, #3, #4, #5, #6, #7, #8)
// - Third chain (7 clusters) for a fragmented, possibly grown file (here: #9, #A, #14, #15, #16, #19, #1A)
// - Fourth chain (7 clusters) for a non-fragmented, possibly truncated file (here: #B, #C, #D, #E, #F, #10, #11)
// - Empty clusters
// - Fifth chain (1 cluster) for a sub-directory (here: #23)
// - Bad clusters (3 clusters) (here: #27, #28, #2D)
describe( 'Allocation Table', function() {

  describe( 'FAT12', function() {

    var table = null
    var buffer = buf(`
      F0 FF FF 03 40 00 05 60 00 07 80 00 FF AF 00 14
      C0 00 0D E0 00 0F 00 01 11 F0 FF 00 F0 FF 15 60
      01 19 70 FF F7 AF 01 FF 0F 00 00 70 FF 00 00 00
    `)

    specify( 'construct', function() {
      table = new FAT.Volume.AllocationTable()
      table.bits = 12
      table.tables.push( buffer )
    })

    // Second chain (7 clusters) for a non-fragmented file
    // (here: #0x02, #0x03, #0x04, #0x05, #0x06, #0x07, #0x08)
    specify( '.getClusterChain(2)', function() {
      var chain = table.getClusterChain(2)
      assert.equal( chain.length, 7, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    // Third chain (7 clusters) for a fragmented, possibly grown file
    // (here: #0x09, #0x0A, #0x14, #0x15, #0x16, #0x19, #0x1A)
    specify( '.getClusterChain(9)', function() {
      var chain = table.getClusterChain(9)
      assert.equal( chain.length, 7, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    // Fourth chain (7 clusters) for a non-fragmented, possibly truncated file
    // (here: #0x0B, #0x0C, #0x0D, #0x0E, #0x0F, #0x10, #0x11)
    specify( '.getClusterChain(11)', function() {
      var chain = table.getClusterChain(11)
      assert.equal( chain.length, 7, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    specify( '.getUsage()', function() {
      var stats = table.getUsage()
      assert.deepEqual( stats, { total: 32, used: 27, free: 5 })
      console.log( 'Usage:', inspect( stats ) )
    })

  })

  describe( 'FAT16', function() {

    var table = null
    var buffer = buf(`
      F0 FF FF FF 03 00 04 00 05 00 06 00 07 00 08 00
      FF FF 0A 00 14 00 0C 00 0D 00 0E 00 0F 00 10 00
      11 00 FF FF 00 00 FF FF 15 00 16 00 19 00 F7 FF
      F7 FF 1A 00 FF FF 00 00 00 00 F7 FF 00 00 00 00
    `)

    specify( 'construct', function() {
      table = new FAT.Volume.AllocationTable()
      table.bits = 16
      table.tables.push( buffer )
    })

    // Second chain (7 clusters) for a non-fragmented file
    // (here: #0x02, #0x03, #0x04, #0x05, #0x06, #0x07, #0x08)
    specify( '.getClusterChain(2)', function() {
      var chain = table.getClusterChain(2)
      assert.equal( chain.length, 7, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    // Third chain (7 clusters) for a fragmented, possibly grown file
    // (here: #0x09, #0x0A, #0x14, #0x15, #0x16, #0x19, #0x1A)
    specify( '.getClusterChain(9)', function() {
      var chain = table.getClusterChain(9)
      assert.equal( chain.length, 7, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    // Fourth chain (7 clusters) for a non-fragmented, possibly truncated file
    // (here: #0x0B, #0x0C, #0x0D, #0x0E, #0x0F, #0x10, #0x11)
    specify( '.getClusterChain(11)', function() {
      var chain = table.getClusterChain(11)
      assert.equal( chain.length, 7, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    specify( '.getUsage()', function() {
      var stats = table.getUsage()
      assert.deepEqual( stats, { total: 32, used: 27, free: 5 })
      console.log( 'Usage:', inspect( stats ) )
    })

  })

  describe( 'FAT32', function() {

    var table = null
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

    specify( 'construct', function() {
      table = new FAT.Volume.AllocationTable()
      table.bits = 32
      table.tables.push( buffer )
    })

    // First chain (1 cluster) for the root directory,
    // pointed to by an entry in the FAT32 BPB (here: #0x02)
    specify( '.getClusterChain(2)', function() {
      var chain = table.getClusterChain(2)
      assert.equal( chain.length, 1, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    // Second chain (6 clusters) for a non-fragmented file
    // (here: #0x03, #0x04, #0x05, #0x06, #0x07, #0x08)
    specify( '.getClusterChain(3)', function() {
      var chain = table.getClusterChain(3)
      assert.equal( chain.length, 6, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    // Third chain (7 clusters) for a fragmented, possibly grown file
    // (here: #0x09, #0x0A, #0x14, #0x15, #0x16, #0x19, #0x1A)
    specify( '.getClusterChain(9)', function() {
      var chain = table.getClusterChain(9)
      assert.equal( chain.length, 7, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    // Fourth chain (7 clusters) for a non-fragmented, possibly truncated file
    // (here: #0x0B, #0x0C, #0x0D, #0x0E, #0x0F, #0x10, #0x11)
    specify( '.getClusterChain(11)', function() {
      var chain = table.getClusterChain(11)
      assert.equal( chain.length, 7, 'Unexpected chain length' )
      console.log( inspect( chain ) )
    })

    specify( '.getUsage()', function() {
      var stats = table.getUsage()
      assert.deepEqual( stats, { total: 32, used: 27, free: 5 })
      console.log( 'Usage:', inspect( stats ) )
    })

  })

})
