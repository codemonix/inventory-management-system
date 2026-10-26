# ==========================================
# STAGE 1: Build Environment
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies 
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Compile TypeScript to JavaScript (Outputs to the /dist folder)
RUN npm run build

# ==========================================
# STAGE 2: Production Environment
# ==========================================
FROM node:22-alpine

WORKDIR /app

# Set to production to ensure frameworks optimize their performance.
# DB_URI and JWT_SECRET must be provided at runtime (compose env / env_file), never baked in.
ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the compiled JavaScript code from the builder stage
COPY --from=builder /app/dist ./dist

# Uploads live in a volume; create it owned by the unprivileged user
RUN mkdir -p uploads/items uploads/temp && chown -R node:node uploads
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Run the compiled JavaScript file
CMD [ "node", "dist/server.js" ]
