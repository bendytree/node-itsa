#!/bin/bash


set -o errexit # Exit on error

if [ -z "$(git status --porcelain)" ]; then
  echo "Working directory clean..."
else
  echo "ERROR: WORKING DIRECTORY DIRTY. PLEASE COMMIT ALL CHANGES"
  exit 1
fi

echo "Running tests..."
npm run test

echo "Bump version..."
node scripts/bump-version.js

echo "Browserifying..."
./node_modules/.bin/browserify ./index.js -d --s itsa -o ./dist/itsa.js

echo "Updating credits..."
node scripts/update-credits.js

echo "Minifying..."
./node_modules/.bin/uglifyjs ./dist/itsa.js --comments -c > ./dist/itsa.min.js

echo "minified size..."
du -h ./dist/itsa.min.js

echo "gzip size..."
gzip -c ./dist/itsa.min.js | wc -c

echo "Running git add..."
git add .

echo "Running git commit..."
git commit -am "Bundling and version bump"

echo "Tagging git version..."
node scripts/git-tag.js

echo "Pushing to GitHub..."
git push origin master

echo "Pushing git tags..."
git push --tags

echo "Pushing to NPM..."
npm publish

echo "Release Success!"

