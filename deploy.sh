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
#npm i
#cp app/index.static.jade app/404.static.jade
rm -rf _public
# XXX: use --reference when not in shallow clone
#git clone $REPO --reference . -b gh-pages _public
git clone $REPO --depth 1 -b gh-pages _public

REV=`git describe --always`
cp index.html _public/

cd _public
git fetch --depth 1 origin master:master
git add -A .
echo "regen for $REV" | git commit-tree `git write-tree` -p `git rev-parse HEAD` -p $REV | xargs git reset --hard
git push $upstream gh-pages
cd ..
#rm -f app/404.static.jade

