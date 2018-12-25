var fs = require( 'fs' )
var path = require( 'path' )
var MBR = require( 'mbr' )
var FAT = require( '..' )
var inspect = require( '../test/inspect' )

var filename = path.resolve( process.cwd(), process.argv.slice(2).shift() )

var fd = fs.openSync( filename, 'r' )
var buffer = Buffer.allocUnsafe( 512 )

fs.readSync( fd, buffer, 0, buffer.length, 0 )
fs.closeSync( fd )

var mbr = MBR.parse( buffer )
var start = mbr.partitions[0].firstLBA * 512
var end = mbr.partitions[0].lastLBA * 512

var volume = new FAT.Volume({
  bits: 32,
  readOnly: false,
  path: filename,
  start: start,
  end: end,
})

volume.open(( error ) => {
  console.log( error || inspect( volume ) )
  volume.readDir( volume.vbr.rootDirCluster, ( error, directory ) => {
    console.log( inspect( directory ) )
    volume.close(( error ) => {
      console.log( 'Volume closed', error || 'OK' )
    })
  })
})
