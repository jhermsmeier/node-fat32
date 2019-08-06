var fs = require( 'fs' )
var path = require( 'path' )
var MBR = require( 'mbr' )
var FAT = require( '..' )
var async = require( '../lib/async' )
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
  path: filename,
  start: start,
  end: end,
})

function getAttrs( entry ) {

  var attrs = []

  if( entry.isReadOnly ) attrs.push( 'readonly' )
  if( entry.isHidden ) attrs.push( 'hidden' )
  if( entry.isSystem ) attrs.push( 'system' )
  if( entry.isVolumeLabel ) attrs.push( 'volumelabel' )
  if( entry.isDirectory ) attrs.push( 'directory' )
  if( entry.isArchive ) attrs.push( 'archive' )
  if( entry.isDevice ) attrs.push( 'device' )

  return attrs

}

function walk( rootDirCluster, depth, parent, callback ) {

  volume.readDir( rootDirCluster, ( error, directory ) => {

    var index = 0

    async.whilst(
      function condition() {
        return index < directory.entries.length
      },
      function iter( next ) {

        var entry = directory.entries[ index++ ]

        if( entry.filename === '.' || entry.filename === '..' ) {
          return next() // skip . / .. dir entries
        }

        var attrs = getAttrs( entry )

        if( entry.isDirectory ) {
          process.stdout.write(
            `${'  '.repeat( depth )}📁  ${ entry.longFileName || ( entry.filename + entry.ext ) }/`
              + ` \u001b[90m[${attrs.join(', ')}]\u001b[39m`
              // + ` 0x${entry.attr.toString(16)}`
              + '\n'
          )
          walk( entry.cluster, depth + 1, entry, next )
        } else {
          process.stdout.write(
            `${'  '.repeat( depth )}🗂  ${ entry.longFileName || ( entry.filename + entry.ext ) }`
              + ` \u001b[90m(${entry.fileSize} B) [${attrs.join(', ')}]\u001b[39m`
              // + ` 0x${entry.attr.toString(16)}`
              + '\n'
          )
          next()
        }

      },
      function done( error ) {
        callback( error )
      }
    )

  })

}

volume.open(( error ) => {
  console.log( error || inspect( volume ) )
  console.log( '' )
  walk( volume.vbr.rootDirCluster, 0, null, ( error ) => {
    volume.close(( error ) => {
      console.log( '' )
      console.log( 'Volume closed', error || 'OK' )
    })
  })
})
