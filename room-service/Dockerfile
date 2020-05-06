FROM node:10
WORKDIR /app
COPY package*.json ./
RUN npm install
WORKDIR /app/src
COPY . .
EXPOSE 3000
RUN npm install -g nodemon
CMD [ "npm", "start" ]

