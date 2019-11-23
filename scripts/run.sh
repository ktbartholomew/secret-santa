#!/bin/bash

set -ueo pipefail

CURDIR=$(cd $(dirname ${BASH_SOURCE}[0]) && pwd)

if [[ "${INTERACTIVE:-""}" == "true" ]];then
  DOCKERFLAGS="--rm -it"
  DOCKERCMD="bash"
else
  DOCKERFLAGS="-d"
  DOCKERCMD=""
fi

docker run \
${DOCKERFLAGS} \
--name santa-app \
--net santa \
-e MONGO_HOST=${MONGO_HOST} \
-e MONGO_PORT=${MONGO_PORT} \
-e MONGO_USER=${MONGO_USER} \
-e MONGO_PASS=${MONGO_PASS} \
-e MONGO_DB=${MONGO_DB} \
-e FACEBOOK_APP_ID=${FACEBOOK_APP_ID} \
-v ${CURDIR}/../:/usr/src/app \
quay.io/ktbartholomew/secret-santa \
${DOCKERCMD}
