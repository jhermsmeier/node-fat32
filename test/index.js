var FAT = require( '../' )
var BlockDevice = require( 'blockdevice' )
var RamDisk = require( 'ramdisk' )
var assert = require( 'assert' )
var fs = require( 'fs' )
var path = require( 'path' )
var inspect = require( './inspect' )

var images = [ 'fat12', 'fat16', 'fat32' ]

images.forEach( function( image ) {

  describe( image.toUpperCase(), function() {

    var filename = path.join( __dirname, 'data', image + '.bin' )
    var device = null
    var volume = null

    before( 'decompress', function( done ) {
      fs.createReadStream( filename + '.gz' )
        .pipe( require( 'zlib' ).createGunzip() )
        .pipe( fs.createWriteStream( filename ) )
        .once( 'finish', done )
    })

    before( 'device', function( done ) {

      device = new BlockDevice({
        path: filename,
        blockSize: 512,
        size: fs.statSync( filename ).size,
      })

      device.open( done )

    })

    specify( 'create volume', function() {
      volume = new FAT.Volume()
    })

    specify( 'mount device -> volume', function( done ) {
      volume.mount( device, {}, function( error ) {
        console.log( error || inspect( volume ) )
        done( error )
      })
    })

    specify( 'unmount', function( done ) {
      volume.unmount( done )
    })

    after( 'device:close', function( done ) {
      device.close( done )
    })

  })

})
