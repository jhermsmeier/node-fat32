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

Entry.SIZE = 32

// Directory Entry Attributes
// TODO: Move this under FAT.* namespace
Entry.READONLY = 0x01
Entry.HIDDEN = 0x02
Entry.SYSTEM = 0x04
Entry.VOLUME_LABEL = 0x08
Entry.LFN_FRAGMENT = 0x0F
Entry.DIRECTORY = 0x10
Entry.ARCHIVE = 0x20
Entry.USER = 0x27
Entry.DEVICE = 0x40
Entry.RESERVED = 0x80

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
  get isReadOnly()    { return !!( this.attr & Entry.READONLY ) },
  get isHidden()      { return !!( this.attr & Entry.HIDDEN ) },
  get isSystem()      { return !!( this.attr & Entry.SYSTEM ) },
  get isVolumeLabel() { return !!( this.attr & Entry.VOLUME_LABEL ) },
  get isDirectory()   { return !!( this.attr & Entry.DIRECTORY ) },
  get isArchive()     { return !!( this.attr & Entry.ARCHIVE ) },
  get isDevice()      { return !!( this.attr & Entry.DEVICE ) },
  get isReserved()    { return !!( this.attr & Entry.RESERVED ) },

  // Special cases
  get isRelativeDir() {
    return this.filename === '.' || this.filename === '..'
  },

  get isDeleted() {
    return this.filename[0] === '\xE5' ||
      this.filename[0] === '\x05'
  },

  parse( buffer, offset ) {

    offset = offset || 0

    // TODO: VFAT LFNs
    this.filename = buffer.toString( 'binary', offset + 0, offset + 8 )
      .replace( /\s+$/, '' )
    this.ext = buffer.toString( 'binary', offset + 8, offset + 11 )
      .replace( /\s+$/, '' )

    this.attr = buffer.readUInt8( offset + 11 )
    // this.reserved = buffer.readUInt8( offset + 12 )

    this.creationTime = time(
      buffer.readUInt16LE( offset + 14 ),
      buffer.readUInt16LE( offset + 16 ),
      buffer.readUInt8( offset + 13 )
    )

    this.accessTime = time( null, buffer.readUInt16LE( offset + 18 ) )

    this.accessRights = buffer.readUInt16LE( offset + 20 )

    this.modifiedTime = time(
      buffer.readUInt16LE( offset + 22 ),
      buffer.readUInt16LE( offset + 24 )
    )

    // this.clusterLow = buffer.readUInt16LE( offset + 26 )
    // this.clusterHigh = this.accessRights
    // this.cluster = ( this.clusterHigh << 16 ) | this.clusterLow
    this.cluster = ( this.accessRights << 16 ) |
      buffer.readUInt16LE( offset + 26 )

    this.fileSize = buffer.readUInt32LE( offset + 28 )

  },

  write( buffer, offset ) {
    throw new Error( 'Not implemented' )
  },

}

// Exports
module.exports = Entry
