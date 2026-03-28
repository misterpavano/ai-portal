#!/bin/bash
cd "$(dirname "$0")"
git pull
npm install --prefer-offline --silent
npm start
