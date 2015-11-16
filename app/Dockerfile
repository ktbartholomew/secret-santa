FROM node:4.2.2
WORKDIR /usr/src/app
EXPOSE 3000

RUN npm install -g grunt-cli
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app/
RUN grunt build

CMD npm start
