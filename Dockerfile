FROM node:10.13
ENV NPM_CONFIG_LOGLEVEL=warn
WORKDIR /usr/src/app
EXPOSE 3000

RUN npm install -g grunt-cli
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . /usr/src/app/
CMD npm start
