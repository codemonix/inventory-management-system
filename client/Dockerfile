
# base image -> copy -> Build
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY .env.production .
RUN npm ci
COPY . . 

ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM nginx:stable-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html


# HTTP port
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;"]