#!/bin/bash


set -o errexit # Exit on error

echo "Running tests..."
npm run test

echo "Bump version..."
node bin/bump-version.js

echo "Browserifying..."
./node_modules/.bin/browserify ./index.js -d --s itsa -o ./dist/itsa.js

echo "Updating credits..."
node bin/update-credits.js

echo "Minifying..."
./node_modules/.bin/uglifyjs ./dist/itsa.js -c > ./dist/itsa.min.js

echo "minified size..."
du -h ./dist/itsa.min.js

echo "gzip size..."
gzip -c ./dist/itsa.min.js | wc -c


#if [ -z "$(git status --porcelain)" ]; then
#  echo "Working directory clean..."
#else
#  echo "ERROR: WORKING DIRECTORY DIRTY. PLEASE COMMIT ALL CHANGES"
#  exit 1
#fi

echo "Running git add..."
git add .

echo "Running git commit..."
git commit -am "Updated distribution bundles"

echo "Tagging git version..."
node bin/git-tag.js

echo "Pushing to GitHub..."
git push origin master

echo "Pushing to NPM..."
npm publish

echo "Release Success!"

