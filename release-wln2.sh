#!/bin/bash

set -eu

VERSION=$1
MESSAGE=$2
STUDY_ASSETS=$3
./deploy-wln2.sh "$STUDY_ASSETS"
git tag -a "$VERSION" -m "$MESSAGE"
echo "$VERSION" > "$STUDY_ASSETS"/version
