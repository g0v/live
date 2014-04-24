#!/bin/sh
set -e -x
git --version
upstream=$1
: ${upstream:=origin}
: ${REPO:=git@github.com:g0v/live.git}
git fetch $upstream
if [ `git rev-list HEAD...$upstream/master --count` -ne 0 ]; then
  echo "not deploying"
  exit 1
fi
REV=`git describe --always`

rm -rf _public

# XXX: use --reference when not in shallow clone
#git clone $REPO --reference . -b gh-pages _public
git clone $REPO --depth 1 -b gh-pages _public

# Use node utilities "related" to current working directory.
export PATH="node_modules/.bin:$PATH";

# build/install live
npm install
bower install
brunch build

# build/install link_manager
pushd link_manager
npm install
bower install
grunt build
popd #link_manager
mkdir -p _public/link_manager
cp -rp link_manager/dist/* _public/link_manager

pushd _public
git fetch --depth 1 origin master:master
git add -A .
echo "regen for $REV" | git commit-tree `git write-tree` -p `git rev-parse HEAD` -p $REV | xargs git reset --hard
git push $upstream gh-pages
popd #_public

