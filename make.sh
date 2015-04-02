#!/bin/bash
DIR=$(cd $(dirname $0); pwd)
cd $DIR
DATE=`date +%Y_%m_%d`

rm *.xpi

cd Echofon/
zip -r -9 Echofon.jar *
cd ../
cp Echofon.jar src/chrome/
cd src/
zip -r -9 mod_echofon_${DATE}.xpi *
cd ../
mv -v *.xpi .
