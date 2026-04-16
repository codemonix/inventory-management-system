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

# Set to production to ensure frameworks optimize their performance
ENV NODE_ENV=production
ENV PORT=5000
ENV DB_URI='mongodb://ims_mongo:27017'

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the compiled JavaScript code from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 5000

RUN echo "Create item uploads folder"
# RUN mkdir -p uploads # Uncomment if you need the physical directory created

# Run the compiled JavaScript file
CMD [ "node", "dist/server.js" ]