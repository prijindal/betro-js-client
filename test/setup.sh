#!/bin/sh

rm -rf /tmp/betro-server &&
git clone https://prijindal@github.com/prijindal/betro-server.git /tmp/betro-server -b master --depth 1 &&
cd /tmp/betro-server &&
npm install &&
npm run build
npm run migrate