#!/bin/bash

set -o errexit # Exit on error

echo "Browserifying..."
./node_modules/.bin/browserify ./index.js -d --s itsa -o ./dist/itsa.js

echo "Minifying..."
./node_modules/.bin/uglifyjs ./dist/itsa.js -c > ./dist/itsa.min.js

echo "minified size..."
du -h ./dist/itsa.min.js

echo "gzip size..."
gzip -c ./dist/itsa.min.js | wc -c

