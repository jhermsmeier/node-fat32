var FAT32 = require( '../' )
var RamDisk = require( 'ramdisk' )
var assert = require( 'assert' )

describe( 'FAT32', function() {

  describe( 'Volume Boot Record', function() {

    it( '512 byte min size', function() {
      assert.throws( function() {
        var vbr = new FAT32.Volume.BootRecord()
        var buffer = new Buffer( 500 )
        vbr.parse( buffer )
      })
    })

    it( 'parse anything', function() {
      var vbr = new FAT32.Volume.BootRecord()
      var buffer = new Buffer( 512 )
      vbr.parse( buffer )
    })

  })

})
