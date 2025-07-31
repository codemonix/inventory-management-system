
# base image -> copy -> Build
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci
COPY . . 

RUN npm run build

# Production stage
FROM nginx:stable-alpine AS runner

# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./public/config.js /usr/share/nginx/html/config.js

# COPY entrupoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh
# ENTRYPOINT [ "/entrypoint.sh" ]


# HTTP port
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;"]