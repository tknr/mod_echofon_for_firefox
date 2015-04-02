#!/bin/bash
DIR=$(cd $(dirname $0); pwd)
cd $DIR
DATE=`date +%Y_%m_%d` 
zip -r -9 Echofon.jar Echofon/
cp Echofon.jar src/chrome/
zip -r -9 echofon_${DATE}.xpi src/