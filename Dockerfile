FROM node:18 as build

WORKDIR /usr/src/app
EXPOSE 3000

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY . /usr/src/app/
RUN npm run build

CMD npm start
