var FAT32 = require( '../' )
var RamDisk = require( 'ramdisk' )
var assert = require( 'assert' )

describe( 'FAT32', function() {

  describe( 'format', function() {

    var device = new RamDisk({
      // 32 MB min FAT32 size
      size: 32 * 1024 * 1024
    })

    it( 'should be able to format a volume', function( done ) {

      FAT32.format( device, {
        // options
      }, function( error, volume ) {
        done( error )
      })

    })

  })

})
