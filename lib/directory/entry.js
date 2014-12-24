/**
 * Entry Constructor
 * @return {Entry}
 */
function Entry() {
  
  if( !(this instanceof Entry) )
    return new Entry()
  
}

// Directory Entry Attributes
Entry.READONLY     = 0x01
Entry.HIDDEN       = 0x02
Entry.SYSTEM       = 0x04
Entry.VOLUME_LABEL = 0x08
Entry.DIRECTORY    = 0x10
Entry.ARCHIVE      = 0x20
Entry.DEVICE       = 0x40
Entry.RESERVED     = 0x80

// FAT32 Time conversion helper fn
// TODO: Put this somewhere helpful &
// make conversion work both ways
function time( time, date, ms ) {
  
  time = time || 0
  date = date || 0
  
  var hours   = ( time & 0xF800 ) >>> 11
  var minutes = ( time & 0x07E0 ) >>> 5
  var seconds = (( time & 0x001F ) >>> 0 ) * 2
  
  var year  = (( date & 0xFE00 ) >>> 9 ) + 1980
  var month = ( date & 0x01E0 ) >>> 5
  var day   = ( date & 0x001F ) >>> 0
  
  return Date.UTC(
    year, month - 1, day,
    hours, minutes, seconds,
    ms ? ms * 10 : 0
  )
  
}

/**
 * Entry Prototype
 * @type {Object}
 */
Entry.prototype = {
  
  constructor: Entry,
  
  // Attribute Getters
  get isReadonly()    { return !!( this.attr & Entry.READONLY ) },
  get isHidden()      { return !!( this.attr & Entry.HIDDEN ) },
  get isSystem()      { return !!( this.attr & Entry.SYSTEM ) },
  get isVolumeLabel() { return !!( this.attr & Entry.VOLUME_LABEL ) },
  get isDirectory()   { return !!( this.attr & Entry.DIRECTORY ) },
  get isArchive()     { return !!( this.attr & Entry.ARCHIVE ) },
  get isDevice()      { return !!( this.attr & Entry.DEVICE ) },
  get isReserved()    { return !!( this.attr & Entry.RESERVED ) },
  
  parse: function( buffer ) {
    
    // TODO: VFAT LFNs
    this.filename = buffer.toString( 'ascii', 0, 8 )
      .replace( /\s+$/, '' )
    this.ext = buffer.toString( 'ascii', 8, 11 )
      .replace( /\s+$/, '' )
    
    this.attr = buffer.readUInt8( 11 )
    // this.reserved = buffer.readUInt8( 12 )
    
    this.creationTime = time(
      buffer.readUInt16LE( 14 ),
      buffer.readUInt16LE( 16 ),
      buffer.readUInt8( 13 )
    )
    
    this.accessDate = time( null, buffer.readUInt16LE( 18 ) )
    
    this.accessRights = buffer.readUInt16LE( 20 )
    
    this.modifiedTime = time(
      buffer.readUInt16LE( 22 ),
      buffer.readUInt16LE( 24 )
    )
    
    // this.clusterLow = buffer.readUInt16LE( 26 )
    // this.clusterHigh = this.accessRights
    // this.cluster = ( this.clusterHigh << 16 ) | this.clusterLow
    this.cluster = ( this.accessRights << 16 ) |
      buffer.readUInt16LE( 26 )
    
    this.fileSize = buffer.readUInt32LE( 28 )
    
  },
  
}

// Exports
module.exports = Entry
