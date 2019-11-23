#!/bin/bash

CURDIR=$(cd $(dirname ${BASH_SOURCE}[0]) && pwd)

docker run \
-d \
--name santa-proxy \
--net santa \
-p 3000:80 \
-p 3001:443 \
-v ${CURDIR}/../proxy/proxy.conf:/etc/nginx/conf.d/default.conf \
-v ${CURDIR}/../proxy/proxy.crt:/run/tls.crt \
-v ${CURDIR}/../proxy/proxy.key:/run/tls.key \
nginx:latest
