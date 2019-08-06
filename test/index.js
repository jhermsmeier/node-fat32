var assert = require( 'assert' )
var fs = require( 'fs' )
var path = require( 'path' )
var inspect = require( './inspect' )
var FAT = require( '../' )

var images = [ 'fat12', 'fat16', 'fat32' ]

images.forEach( function( image ) {

  describe( image.toUpperCase(), function() {

    var filename = path.join( __dirname, 'data', image + '.img' )
    var device = null
    var volume = null

    before( 'decompress', function( done ) {
      fs.createReadStream( filename + '.gz' )
        .pipe( require( 'zlib' ).createGunzip() )
        .pipe( fs.createWriteStream( filename ) )
        .once( 'finish', done )
    })

    context( 'Volume', function() {

      specify( 'new Volume()', function() {
        volume = new FAT.Volume({ path: filename })
      })

      specify( 'volume.open()', function( done ) {
        volume.open( function( error ) {
          console.log( error || inspect( volume ) )
          done( error )
        })
      })

      context( 'volume.fat', function() {

        specify( '.getCluster(0)', function() {
          console.log( inspect( volume.fat.getCluster(0) ) )
        })

        specify( '.getCluster(1)', function() {
          console.log( inspect( volume.fat.getCluster(1) ) )
        })

        specify( '.getCluster(rootClusterNo)', function() {
          var rootClusterNo = volume.vbr.rootDirCluster
          console.log( inspect( volume.fat.getCluster(rootClusterNo) ) )
        })

        specify( '.getClusterChain(rootClusterNo)', function() {
          var rootClusterNo = volume.vbr.rootDirCluster
          console.log( inspect( volume.fat.getClusterChain(rootClusterNo) ) )
        })

        specify( '.getUsage()', function() {
          var stats = volume.fat.getUsage()
          console.log( inspect( stats ) )
        })

      })

      after( 'volume.close()', function( done ) {
        volume.close( done )
      })

    })

  })

})
