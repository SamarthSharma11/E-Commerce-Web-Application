# =====================================================
# Server Dockerfile — Multi-stage build
# =====================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript
RUN npm run build

# =====================================================
# Stage 2: Production
# =====================================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/docs ./src/docs

# Create uploads directory for local image storage
RUN mkdir -p /app/public/uploads

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Run server
CMD ["node", "dist/server.js"]
