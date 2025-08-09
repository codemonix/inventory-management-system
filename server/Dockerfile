

# base image
FROM node:18-alpine

WORKDIR /app

# Copy package and install dependencies
COPY package*.json ./
RUN npm ci

COPY . .

ENV PORT=5000
ENV DB_URI='mongodb://ims_mongo:27017'

EXPOSE 5000

RUN echo " Create item uploads folder"

CMD [ "node", "server.js" ]