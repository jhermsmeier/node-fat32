var fs = require( 'fs' )

class FileDevice {

  constructor( options ) {

    options = options || {}

    this.path = options.path || null
    this.fd = options.fd || null
    this.flags = options.flags || 'r'
    this.mode = options.mode || null

    this.start = options.start || 0
    this.end = options.end || Infinity

  }

  open( callback ) {
    fs.open( this.path, this.flags, this.mode, ( error, fd ) => {
      this.fd = fd || null
      callback( error )
    })
  }

  read( buffer, offset, length, position, callback ) {
    position = position + this.start
    if( position < this.start || position > this.end ) {
      return void callback.call( this, new Error( `Read from ${position} out of bounds` ) )
    }
    fs.read( this.fd, buffer, offset, length, position, callback )
  }

  write( buffer, offset, length, position, callback ) {
    position = position + this.start
    if( position < this.start || position > this.end ) {
      return void callback.call( this, new Error( `Write to ${position} out of bounds` ) )
    }
    fs.write( this.fd, buffer, offset, length, position, callback )
  }

  close( callback ) {
    fs.close( this.fd, callback )
    this.fd = null
  }

}

module.exports = FileDevice
