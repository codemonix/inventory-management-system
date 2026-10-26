
# base image -> copy -> Build
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Build tools (vite, typescript) are devDependencies, so install everything here
RUN npm ci
COPY . . 
RUN npm run build

# Production stage
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# runtime config template and script
COPY runtime-config.js.tpl /usr/share/nginx/html/config.js.tpl
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh


# HTTP port
EXPOSE 80
ENTRYPOINT [ "/docker-entrypoint.sh" ]
CMD [ "nginx", "-g", "daemon off;"]
