

# base image
FROM node:22-alpine

RUN mkdir -p /app/uploads

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# App directory
WORKDIR /app

# Copy package and install dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENTRYPOINT [ "docker-entrypoint.sh" ]

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD [ "node", "server.js" ]