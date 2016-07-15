var FAT32 = require( '../' )
var RamDisk = require( 'ramdisk' )
var assert = require( 'assert' )

describe( 'FAT32', function() {

  describe( 'VBR detection test', function() {

    it( 'random assertions', function() {
      new FAT32.test( 'Some test boot sector' )
    })

  })

})
