#!/bin/bash


set -o errexit # Exit on error

if [ -z "$(git status --porcelain)" ]; then
  echo "Working directory clean..."
else
  echo "ERROR: WORKING DIRECTORY DIRTY. PLEASE COMMIT ALL CHANGES"
  exit 1
fi

#echo "Bundling..."
#npm run bundle
#git add ./dist
#git commit -m "Updated distribution bundles"
#
#echo "Updating Version Number..."
#npm version patch
#
#echo "Pushing to GitHub..."
#git push origin master
#
#echo "Pushing to NPM..."
#npm publish
#
#echo "Release Success!"

