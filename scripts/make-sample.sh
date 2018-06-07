#!/usr/bin/env bash

# NOTE: This only works on Mac OS
# Usage:
#   ./make-sample.sh test/data/fat16.img FAT16

FILE=$1
: ${FILE:?must be provided as first argument}

TYPE=$2
: ${TYPE:?must be provided as second argument}

SIZE=$3                  # in MB
case "$TYPE" in
  "FAT12") : ${SIZE:=1}  # <128
  ;;
  "FAT16") : ${SIZE:=5}  # >4
  ;;
  "FAT32") : ${SIZE:=33} # >32
  ;;
  *) : ${SIZE:=1}        # e.g. ExFAT
esac

echo "Making $TYPE of $SIZE MB at $FILE"

if [[ "$TYPE" = FAT* ]]
then
  TYPE="MS-DOS $TYPE"
fi

dd if=/dev/zero of="$FILE" bs=1048576 count="$SIZE"
DEV=$(hdiutil attach "$FILE" -nomount)
diskutil eraseVolume "$TYPE" "FATFS TEST" "$DEV"
hdiutil detach "$DEV"
