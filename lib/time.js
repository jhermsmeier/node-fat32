var util = module.exports

util.getTime = function( time, date, ms ) {

  time = time || 0
  date = date || 0
  ms = ms || 0

  var hours   = ( time & 0xF800 ) >>> 11
  var minutes = ( time & 0x07E0 ) >>> 5
  var seconds = (( time & 0x001F ) >>> 0 ) * 2

  var year  = (( date & 0xFE00 ) >>> 9 ) + 1980
  var month = ( date & 0x01E0 ) >>> 5
  var day   = ( date & 0x001F ) >>> 0

  return Date.UTC(
    year, month - 1, day,
    hours, minutes, seconds,
    ms * 10
  )

}

util.parseDate = function( buffer, offset ) {
  offset = offset || 0
  var date = buffer.readUInt16LE( offset )
  return util.getTime( 0, date )
}

util.parseDateTime = function( buffer, offset ) {

  offset = offset || 0

  var time = buffer.readUInt16LE( offset + 0 )
  var date = buffer.readUInt16LE( offset + 2 )

  return util.getTime( time, date )

}

util.parseDateTimeMs = function( buffer, offset ) {

  offset = offset || 0

  var ms = buffer.readUInt8( offset + 0 )
  var time = buffer.readUInt16LE( offset + 1 )
  var date = buffer.readUInt16LE( offset + 3 )

  return util.getTime( time, date, ms )

}
