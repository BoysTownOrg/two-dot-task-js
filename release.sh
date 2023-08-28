#!/bin/bash

set -eu

version=$1
message=$2
rm dist/*
npx webpack --mode=production
git tag -a "$version" -m "$message"
echo "$version" > dist/version
