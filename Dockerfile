FROM node:10.13
ENV NPM_CONFIG_LOGLEVEL=warn
WORKDIR /usr/src/app
EXPOSE 3000

RUN npm install -g grunt-cli
COPY . /usr/src/app/
RUN npm install

CMD npm start
