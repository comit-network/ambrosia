#!/bin/bash

## This script was only tested in Mac!
## Requierements:
## Inkscape, tested with: 1.0 (4035a4f, 2020-05-01) https://inkscape.org/
## ImageMagick, tested with: 7.0.10-24 Q16 x86_64 2020-07-18 https://imagemagick.org
## iconutil (should be available on Mac by default)

inkscape=/Applications/Inkscape.app/Contents/MacOS/inkscape
insvg=comit-app-logo_yellow-bg_set-in.svg

# Generate all png icons
rm -rf icons
mkdir icons
for x in 16 24 32 48 64 96 128 256 512 1024 ; do $inkscape --export-filename=icons/${x}x${x}.png -w ${x} ${insvg} ; done

# Generate icns file (Mac app icon)
output=icon
tmpdir=${output}.iconset
mkdir $tmpdir
for sz in 16 32 128 256 512
do
    echo "[+] Generete ${sz}x${sz} png..."
    $inkscape --export-filename=${tmpdir}/icon_${sz}x${sz}.png -w $sz -h $sz $insvg
    $inkscape --export-filename=${tmpdir}/icon_${sz}x${sz}@2x.png -w $((sz*2)) -h $((sz*2)) $insvg
done
iconutil --convert icns --output ${output}.icns ${tmpdir}
echo "[v] Created icns as: ${output}.icns."
rm -rf ${tmpdir}

# Generate ico file
magick convert icons/16x16.png icons/32x32.png icons/48x48.png icons/96x96.png icons/128x128.png icons/256x256.png icons/512x512.png icon.ico

# Copy 256X256 png as icon.png to build folder to be used to Win/Linux
rm icon.png
cp icons/256x256.png icon.png
