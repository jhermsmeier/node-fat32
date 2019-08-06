class FileSystem {

  constructor( volume ) {
    this.volume = volume
  }

  open( filename, flags, mode, callback ) {
    callback( new Error( 'Not implemented' ) )
  }

  close( fd, callback ) {
    callback( new Error( 'Not implemented' ) )
  }

}

module.exports = FileSystem
