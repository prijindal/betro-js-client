#!/bin/sh

rm -rf /tmp/betro-server &&
git clone https://prijindal@github.com/betro-app/betro-server.git /tmp/betro-server &&
cd /tmp/betro-server &&
npm install &&
npm run build &&
npm start &
