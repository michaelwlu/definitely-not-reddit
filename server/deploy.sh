#!/bin/bash

echo What should the version be?
read VERSION

docker build -t michaelwlu/definitely-not-reddit:$VERSION .
docker push michaelwlu/definitely-not-reddit:$VERSION

ssh root@161.35.48.25 "docker pull michaelwlu/definitely-not-reddit:$VERSION && docker tag michaelwlu/definitely-not-reddit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"