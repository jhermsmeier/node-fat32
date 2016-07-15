/**
 * FileSystem Constructor
 * @return {FileSystem}
 */
function FileSystem( volume, options ) {

  if( !(this instanceof FileSystem) )
    return new FileSystem( volume, options )

  this.volume = volume

}

/**
 * FileSystem Prototype
 * @type {Object}
 */
FileSystem.prototype = {

  constructor: FileSystem,

}

// Exports
module.exports = FileSystem
