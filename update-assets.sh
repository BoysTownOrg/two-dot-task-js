#!/bin/bash

set -eu

sourceDir="../WLN_Day 1_Experiment 1b_Seth"
destDir=assets
if compgen -G $destDir/audio/* > /dev/null; then
    echo "removing old audio"
    rm $destDir/audio/*
fi
echo "copying new audio"
find "$sourceDir/Audio Files/" -name "*.wav" -a -not -path "*OLD*" -exec cp {} $destDir/audio/ \;
echo "fixing audio extensions"
for file in "$destDir"/audio/*.wav.wav; do mv "$file" "$(dirname "$file")/$(basename "$file" .wav)"; done
echo "copying new images"
find "$sourceDir/WLN_Exp 1b_Images/" -name "*.png" -a -not -path "*OLD*" -exec cp {} $destDir/images/ \;
echo "copying new spreadsheet"
cp "$sourceDir"/*.xlsx assets/order.xlsx
