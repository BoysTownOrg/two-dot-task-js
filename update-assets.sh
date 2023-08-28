#!/bin/bash

rm assets/audio/*
find ../WLN_Day 1_Experiment 1b_Seth/Audio Files/ -name "*.wav" -a -not -path "*OLD*" -exec cp {} assets/audio/ \;
for file in assets/audio/*.wav.wav; do mv "$file" "$(dirname "$file")/$(basename "$file" .wav)"; done
find ../WLN_Day 1_Experiment 1b_Seth/WLN_Exp 1b_Images/ -name "*.png" -a -not -path "*OLD*" -exec cp {} assets/images/ \;
cp ../WLN_Day 1_Experiment 1b_Seth/*.xlsx assets/order.xlsx
