#!/bin/bash

echo What should the version be?
read VERSION

docker build -t michaelwlu/definitely-not-reddit:$VERSION . \
&& docker push michaelwlu/definitely-not-reddit:$VERSION \
&& ssh root@206.189.196.146 "docker pull michaelwlu/definitely-not-reddit:$VERSION && docker tag michaelwlu/definitely-not-reddit:$VERSION dokku/api:$VERSION && dokku tags:deploy api $VERSION"