/**
 * Entry Constructor
 * @return {Entry}
 */
function Entry() {
  
  if( !(this instanceof Entry) )
    return new Entry()
  
  this.filename = ''
  this.ext = ''
  this.attr = 0x00
  // this.reserved = 0x00
  this.creationTime = new Date()
  this.accessTime = new Date()
  this.accessRights = 0x0000
  this.modifiedTime = new Date()
  this.cluster = 0x00000000
  this.fileSize = 0x00000000
  
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
    
    this.accessTime = time( null, buffer.readUInt16LE( 18 ) )
    
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
  
  parseLFNEntry: function( buffer ) {
    
    var entry = {}
    
    // bit 6: last logical, first physical LFN entry, bit 5: 0;
    // deleted entry: 0xE5
    entry.sequenceNumber = buffer.readUInt8( 0 )
    // bits 4-0: number 0x01..0x14 (0x1F)
    entry.number = buffer.readUInt8( 0 ) & 0x1F
    entry.attr = buffer.readUInt8( 11 )
    entry.type = buffer.readUInt8( 12 )
    entry.checksum = buffer.readUInt8( 13 )
    entry.firstCluster = buffer.readUInt16LE( 26 )
    entry.chars = buffer.toString( 'ucs2', 1, 11 ) +
      buffer.toString( 'ucs2', 14, 26 ) +
      buffer.toString( 'ucs2', 28, 32 )
    
    // LFNs strings end with \u0000 and
    // are padded with \uFFFF after that
    entry.chars = entry.chars.replace( /\u0000|\uFFFF/g, '' )
    
    return this
    
  },
  
  getEntries: function() {
    throw new Error( 'Not implemented' )
  },
  
  toBuffer: function() {
    throw new Error( 'Not implemented' )
  },
  
}

// Exports
module.exports = Entry
