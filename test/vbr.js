var FAT32 = require( '../' )
var RamDisk = require( 'ramdisk' )
var assert = require( 'assert' )

describe( 'FAT32', function() {
  
  describe( 'Volume Boot Record', function() {
    
    it( 'should be able to determine if it\'s the right one', function() {
      new FAT32.test( 'Some test boot sector' )
    })
    
    it( 'should be able to parse it', function() {
      var vbr = new FAT32.Volume.BootRecord()
      vbr.parse( 'Some test boot sector' )
    })
    
  })
  
})
