# Test Dockerfile for E2E testing with Cypress
FROM node:22-bullseye

# Install dependencies needed for Cypress
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Keep Cypress binary cache outside bind-mounted app paths.
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with retries to handle transient registry/cache failures
RUN set -eux; \
  for attempt in 1 2 3; do \
    yarn cache clean || true; \
    if yarn install --frozen-lockfile --legacy-peer-deps; then \
      exit 0; \
    fi; \
    echo "yarn install failed (attempt ${attempt}); retrying..."; \
    sleep $((attempt * 5)); \
  done; \
  echo "yarn install failed after retries"; \
  exit 1

# Preinstall Cypress binary in image so CI-like runs do not depend on runtime download.
RUN npx cypress install --force

# Copy the rest of the application code
COPY . .

# Generate Prisma client in image so tests do not depend on host-generated artifacts.
RUN yarn prisma:generate

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables for testing
ENV NODE_ENV=test
ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1

# Default command (can be overridden in docker-compose)
CMD ["yarn", "dev"]
