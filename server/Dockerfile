

# base image
FROM node:18-alpine

WORKDIR /app

# Copy package and install dependencies
COPY package*.json ./
RUN npm ci 

COPY . .

ENV PORT=3000
ENV DB_URI='mongodb://ims_mongo:27017'

EXPOSE 3000

RUN echo " Create item uploads folder"

CMD [ "node", "server.js" ]