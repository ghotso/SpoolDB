---
title: Docker Deployment
sidebar_position: 99
---

# Docker Deployment Guide

## Quick Start

### Development
```bash
docker-compose up --build
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Configuration

### Environment Variables

All configuration is done via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `8080` | HTTP server port |
| `DB_PATH` | `/data/spooldb.sqlite` | SQLite database file path |
| `LOCALES_PATH` | `/app/locales` | Path to i18n translation files |

### Using Environment Variables

#### docker-compose.yml
```yaml
environment:
  - PORT=3000
  - DB_PATH=/data/my-spooldb.sqlite
```

#### docker run
```bash
docker run -d \
  -p 8080:8080 \
  -e PORT=8080 \
  -e DB_PATH=/data/spooldb.sqlite \
  -v $(pwd)/data:/data \
  spooldb:latest
```

#### .env file
Create a `.env` file:
```env
PORT=8080
DB_PATH=/data/spooldb.sqlite
LOCALES_PATH=/app/locales
```

Then use:
```bash
docker-compose --env-file .env up
```

## Volumes

### Database Persistence

The database is stored in `/data/spooldb.sqlite` inside the container. Mount a volume to persist data:

```yaml
volumes:
  - ./data:/data  # Local directory
  # OR
  - spooldb-data:/data  # Named volume
```

### Locales

Translation files can be:
1. **Baked into image** (default) - Languages included at build time
2. **Mounted as volume** - Easy to add languages without rebuilding:
   ```yaml
   volumes:
     - ./locales:/app/locales:ro
   ```

## Building the Image

### Build locally
```bash
docker build -t spooldb:latest .
```

### Build with specific tag
```bash
docker build -t spooldb:v1.0.0 .
```

### Build for specific platform
```bash
docker build --platform linux/amd64 -t spooldb:latest .
```

## Running the Container

### Basic run
```bash
docker run -d \
  --name spooldb \
  -p 8080:8080 \
  -v $(pwd)/data:/data \
  spooldb:latest
```

### With custom configuration
```bash
docker run -d \
  --name spooldb \
  -p 3000:8080 \
  -e PORT=8080 \
  -e DB_PATH=/data/custom.sqlite \
  -v $(pwd)/data:/data \
  -v $(pwd)/locales:/app/locales:ro \
  spooldb:latest
```

### With resource limits
```bash
docker run -d \
  --name spooldb \
  -p 8080:8080 \
  --memory="512m" \
  --cpus="1.0" \
  -v $(pwd)/data:/data \
  spooldb:latest
```

## Health Checks

The container includes a health check that pings `/health` endpoint:

```bash
# Check health status
docker ps

# Inspect health check
docker inspect --format='{{json .State.Health}}' spooldb | jq
```

## Logs

### View logs
```bash
docker logs spooldb
```

### Follow logs
```bash
docker logs -f spooldb
```

### Last 100 lines
```bash
docker logs --tail 100 spooldb
```

## Backup and Restore

### Backup database
```bash
# Copy database from container
docker cp spooldb:/data/spooldb.sqlite ./backup/spooldb-$(date +%Y%m%d).sqlite

# Or if using volume mount
cp ./data/spooldb.sqlite ./backup/spooldb-$(date +%Y%m%d).sqlite
```

### Restore database
```bash
# Copy database to container
docker cp ./backup/spooldb-20231122.sqlite spooldb:/data/spooldb.sqlite

# Restart container
docker restart spooldb
```

## Updating

### Update image
```bash
# Pull new image (if using registry)
docker pull spooldb:latest

# Rebuild locally
docker-compose build

# Restart with new image
docker-compose up -d
```

### Zero-downtime update
```bash
# Build new image
docker-compose build

# Start new container
docker-compose up -d --scale spooldb=2 --no-recreate

# Stop old container
docker-compose up -d --scale spooldb=1
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs spooldb

# Check if port is in use
netstat -an | grep 8080

# Try running interactively
docker run -it --rm spooldb:latest sh
```

### Database permissions
```bash
# Check permissions
docker exec spooldb ls -la /data

# Fix permissions (if needed)
docker exec -u root spooldb chown -R node:node /data
```

### Access container shell
```bash
docker exec -it spooldb sh
```

### Inspect container
```bash
docker inspect spooldb
```

## Production Considerations

1. **Use named volumes** for database persistence
2. **Set resource limits** to prevent resource exhaustion
3. **Use read-only root filesystem** if possible (requires tmpfs for /tmp)
4. **Run as non-root user** (already configured)
5. **Use secrets management** for sensitive data
6. **Set up log rotation**
7. **Configure backup strategy**
8. **Use reverse proxy** (nginx, traefik) for SSL/TLS

## Multi-Container Setup

For production, consider:
- **Reverse proxy** (nginx/traefik) for SSL termination
- **Backup service** for automated database backups
- **Monitoring** (Prometheus, Grafana)

Example with nginx:
```yaml
services:
  spooldb:
    # ... existing config
    networks:
      - spooldb-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - spooldb
    networks:
      - spooldb-network

networks:
  spooldb-network:
    driver: bridge
```

