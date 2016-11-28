FROM node:6.9.1
ENV NPM_CONFIG_LOGLEVEL=warn
WORKDIR /usr/src/app
EXPOSE 3000

RUN npm install -g grunt-cli nodemon
COPY . /usr/src/app/
RUN npm install

CMD npm start
