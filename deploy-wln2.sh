#!/bin/bash

set -eu

STUDY_ASSETS=$1
bun build jspsych/jatos/word-learning-in-noise-2.ts --outdir="$STUDY_ASSETS"
cp wln2/index.html node_modules/jspsych/css/jspsych.css "$STUDY_ASSETS"

