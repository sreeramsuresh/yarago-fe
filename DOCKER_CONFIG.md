# Docker Configuration for Yarago Frontend

## Environment Variable Handling in Vite

### Important Concept: Build-time vs Runtime

Vite applications inject environment variables **at build time**, not runtime. This means:

- `VITE_*` variables are replaced during `npm run build`
- Once built, the JavaScript bundle contains hardcoded values
- Changing environment variables after building has NO effect
- Docker runtime environment variables are ignored for Vite variables

## Environment Files

The frontend uses different environment files for different scenarios:

### `.env.development`

```
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws/notifications
```

Used when running `npm run dev` locally. Points to local gateway.

### `.env.production`

```
VITE_API_BASE_URL=https://yaragoaidev.codextrix.com/
VITE_WS_URL=wss://api.yarago.com/ws/notifications
```

Used when building for actual production deployment. Points to production API.

### `.env.docker`

```
VITE_API_BASE_URL=http://gateway:8080
VITE_WS_URL=ws://gateway:8080/ws/notifications
```

**NEW**: Used when building the Docker image. Points to the gateway service name within the Docker network.

## Why `gateway:8080` instead of `localhost:8080`?

Inside Docker containers:

- `localhost` refers to the container itself
- Service names (like `gateway`) are DNS-resolvable within the Docker network
- The browser (running on your host) makes requests to the gateway through the container

## How the Dockerfile Works

```dockerfile
# Copy source code
COPY . .

# Copy Docker-specific environment file
COPY .env.docker .env

# Build the application
RUN npm run build
```

1. Copies `.env.docker` as `.env`
2. Vite reads `.env` during build
3. API URLs are baked into the JavaScript bundle
4. The built files are served by nginx

## Rebuilding After Changes

If you change environment variables, you MUST rebuild:

```bash
# Stop and remove the frontend container
docker stop yarago-frontend
docker rm yarago-frontend

# Rebuild and start
docker-compose -f docker-compose-external.yml up --build frontend
```

Or rebuild everything:

```bash
docker-compose -f docker-compose-external.yml down
docker-compose -f docker-compose-external.yml up --build
```

## Nginx Proxy (Alternative Approach)

The Dockerfile includes an nginx proxy configuration at `/api/`:

```nginx
location /api/ {
    proxy_pass http://gateway:8080/;
}
```

This allows the frontend to make requests to `/api/*` which are proxied to the gateway. If you want to use this approach:

1. Change `.env.docker`:

   ```
   VITE_API_BASE_URL=/api
   VITE_WS_URL=ws://localhost:3000/api/ws/notifications
   ```

2. Access the app at `http://localhost:3000`
3. API calls go to `/api/*` which are proxied internally

## Accessing the Application

When running with docker-compose:

- Frontend: http://localhost:3000
- Gateway (direct): http://localhost:9090 (mapped from container port 8080)

The gateway port mapping in docker-compose:

```yaml
gateway:
  ports:
    - "9090:8080" # Host:Container
```

## Troubleshooting

### "net::ERR_NAME_NOT_RESOLVED" for api.yarago.com

**Cause**: Built with `.env.production` instead of `.env.docker`
**Fix**: Rebuild with the corrected Dockerfile

### "Connection refused" to gateway:8080

**Cause**: Gateway service not running or not healthy
**Check**:

```bash
docker ps  # Verify gateway is running
docker logs yarago-gateway  # Check for errors
```

### Changes to .env files not reflecting

**Cause**: Forgot to rebuild the Docker image
**Fix**: Rebuild with `--build` flag

### WebSocket connection failing

**Cause**: WebSocket URL mismatch or nginx not configured for WebSocket
**Check**: Verify `VITE_WS_URL` in `.env.docker` and nginx configuration

## Advanced: Build-time Arguments (Alternative)

If you want to pass variables at build time instead of using `.env.docker`:

```dockerfile
ARG VITE_API_BASE_URL=http://gateway:8080
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env
RUN npm run build
```

Build with:

```bash
docker build --build-arg VITE_API_BASE_URL=http://custom:8080 -t yarago-fe .
```

## Advanced: Runtime Configuration (Complex)

For true runtime configuration (change without rebuild), you need:

1. Build with placeholder values
2. Use a startup script to replace placeholders
3. Trade-off: Adds complexity and startup time

See `Dockerfile.runtime` for an example implementation.
