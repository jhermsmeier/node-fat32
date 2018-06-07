#!/usr/bin/env node
var argv = process.argv.slice(2)
var devicePath = argv.shift() // /dev/disk2

if( !devicePath ) {
  console.log( 'Missing device path' )
  process.exit(1)
}

var FAT = require( '..' )
var BlockDevice = require( 'blockdevice' )
var Disk = require( 'disk' )
var inspect = require( '../test/inspect' )

var device = new BlockDevice({
  path: devicePath,
})

var disk = new Disk( device )
var volume = new FAT.Volume()

function close( error ) {
  error && console.log( 'Error:', error.message )
  disk.close(( error ) => {
    error && console.log( 'Disk error:', error.message )
  })
  setTimeout( () => process.exit(1), 1000 )
}

disk.open( ( error ) => {
  if( error ) return close( error )
  console.log( inspect( disk ) )
  volume.mount( disk.partitions[0], {}, ( error ) => {
    if( error ) return close( error )
    console.log( inspect( volume ) )
    close()
  })
})
