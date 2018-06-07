var fs = require( 'fs' )
var path = require( 'path' )
var BlockDevice = require( 'blockdevice' )
var MBR = require( 'mbr' )
var FAT = require( '..' )
var inspect = require( '../test/inspect' )

var filename = path.resolve( process.cwd(), process.argv.slice(2).shift() )

var mbr = null
var volume = new FAT.Volume({
  bits: 16,
  readOnly: false,
})

var device = new BlockDevice({
  path: filename,
  blockSize: 512,
  size: fs.statSync( filename ).size,
})

device.open(( error ) => {

  device.readBlocks( 0, 1, ( error, buffer ) => {
    mbr = MBR.parse( buffer )
    console.log( inspect( mbr ) )
    var partition = mbr.partitions[0]
    volume.mount( device.partition({
      firstLBA: partition.firstLBA,
      lastLBA: partition.lastLBA,
    }), {}, ( error ) => {
      console.log( error || inspect( volume ) )
      device.close(( error ) => {
        console.log('Device handle closed', error || 'OK')
      })
    })
  })

})
