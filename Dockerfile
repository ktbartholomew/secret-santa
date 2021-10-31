FROM node:16.13.0
ENV NPM_CONFIG_LOGLEVEL=warn
WORKDIR /usr/src/app
EXPOSE 3000

RUN npm install -g grunt-cli
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --production

COPY . /usr/src/app/
CMD npm start
