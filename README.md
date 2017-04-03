# FAT32 File System
[![npm](https://img.shields.io/npm/v/node-fat32.svg?style=flat-square)](https://npmjs.com/package/node-fat32)
[![npm license](https://img.shields.io/npm/l/node-fat32.svg?style=flat-square)](https://npmjs.com/package/node-fat32)
[![npm downloads](https://img.shields.io/npm/dm/node-fat32.svg?style=flat-square)](https://npmjs.com/package/node-fat32)
[![build status](https://img.shields.io/travis/jhermsmeier/node-fat32.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-fat32)

FAT12/16/32 file system driver

## Install via [npm](https://npmjs.com)

```sh
$ npm install --save fat32
```

## Usage

### Related Modules

- [BlockDevice](https://github.com/jhermsmeier/node-blockdevice)
- [Disk](https://github.com/jhermsmeier/node-disk)

### Mounting a partition from a block device

```js
var BlockDevice = require( 'blockdevice' )
var Disk = require( 'disk' )
var FAT = require( 'fat32' )

var device = new BlockDevice({
  path: '/dev/rdisk2', // or i.e. '\\\\.\\PhysicalDrive2' on Windows
})

var disk = new Disk( device )
var volume = new FAT.Volume()

disk.open(( error ) => {

  // For purposes of demonstration, error handling will
  // not tended to in this example, but should of course
  // be implemented in real-world use cases
  if( error ) return handleError( error )

  // Find a FAT formatted partition
  var partNo = disk.mbr.partitions.findIndex(( partition ) => {
    return partition.type === 0x0B || partition.type === 0x0C
  })

  // Mount the partition (with a BlockDevice API)
  volume.mount( disk.partitions[ partNo ], null, ( error ) => {
    console.log( util.inspect( volume ) )
    // ...
    volume.unmount(( error ) => {
      disk.close(( error ) => {
        // ...
      })
    })
  })

})
```

```js
Volume {
  device: Partition {
    device: BlockDevice {
      fd: 13,
      path: '/dev/rdisk2',
      mode: 'r',
      blockSize: 512,
      size: -1,
      headsPerTrack: -1,
      sectorsPerTrack: -1
    },
    firstLBA: 8192,
    lastLBA: 137216
  },
  bits: 32,
  readOnly: true,
  vbr: VBR {
    jmp: <Buffer eb 58 90>,
    oemName: 'mkfs.fat',
    bytesPerSector: 512,
    sectorsPerCluster: 1,
    reservedSectors: 32,
    numberOfFATs: 2,
    rootDirEntries: 0,
    sectorCount: 129024,
    mediaType: 248,
    sectorsPerFAT: 993,
    sectorsPerTrack: 32,
    numberOfHeads: 64,
    hiddenSectors: 0,
    fsType: 'FAT32   ',
    flags: 0,
    version: '0.0',
    rootClusterSector: 2,
    fsInfoSector: 1,
    mirrorSector: 6,
    reserved: <Buffer 00 00 00 00 00 00 00 00 00 00 00 00>,
    driveNumber: 128,
    corrupted: 0,
    extendedSignature: 41,
    id: 1892531337,
    name: 'boot       ',
    code: <Buffer 0e 1 f be 77 7 c ac 22 c0 74 0b 56 b4 0e bb 07 00 cd 10 5e eb f0 32 e4 cd 16 cd 19 eb fe 54 68 69 73 20 69 73 20 6e 6 f 74 20 61 20 62 6 f 6 f 74 61 62 6 c...>,
    signature: 43605,
    rootCluster: 2
  },
  info: FSInfo {
    reserved1: <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00...>,
    freeClusters: 85480,
    lastCluster: 41530,
    reserved2: <Buffer 00 00 00 00 00 00 00 00 00 00 00 00>
  },
  tables: [{
    id: 268435448,
    eoc: 4279238655,
    buffer: <Buffer f8 ff ff 0 f ff ff ff 07 65 00 00 00 ac a0 00 00 05 00 00 00 06 00 00 00 07 00 00 00 08 00 00 00 09 00 00 00 0 a 00 00 00 0b 00 00 00 0 c 00 00 00 0 d 00...>
  }, {
    id: 268435448,
    eoc: 4279238655,
    buffer: <Buffer f8 ff ff 0 f ff ff ff 07 65 00 00 00 ac a0 00 00 05 00 00 00 06 00 00 00 07 00 00 00 08 00 00 00 09 00 00 00 0 a 00 00 00 0b 00 00 00 0 c 00 00 00 0 d 00...>
  }]
}
```
