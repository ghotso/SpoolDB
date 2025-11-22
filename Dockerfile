# Multi-stage build for SpoolDB

# Stage 1: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app

# Copy root package files (for workspace support)
COPY package*.json ./
# Copy workspace package.json
COPY backend/package.json ./backend/

# Install dependencies from root (workspace-aware)
RUN npm ci

# Copy source code
COPY backend/ ./backend/

# Build TypeScript
WORKDIR /app/backend
RUN npm run build

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy root package files (for workspace support)
COPY package*.json ./
# Copy workspace package.json
COPY frontend/package.json ./frontend/

# Install dependencies from root (workspace-aware)
RUN npm ci

# Copy source code
COPY frontend/ ./frontend/

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine
WORKDIR /app

# Copy root package files (for workspace support)
COPY package*.json ./
# Copy workspace package.json
COPY backend/package.json ./backend/

# Install production dependencies only (from root, workspace-aware)
RUN npm ci --omit=dev --ignore-scripts

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy locales
COPY locales /app/locales

# Create data directory for SQLite (with proper permissions)
RUN mkdir -p /data && chown -R node:node /data /app

# Switch to non-root user for security
USER node

# Set default environment variables (can be overridden)
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/data/spooldb.sqlite
ENV LOCALES_PATH=/app/locales

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
WORKDIR /app/backend
CMD ["node", "dist/server.js"]

