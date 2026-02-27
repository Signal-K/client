# Use the official Node.js image
FROM node:22-bullseye

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies with retries to handle transient registry/cache failures
RUN set -eux; \
  for attempt in 1 2 3; do \
    yarn cache clean || true; \
    if yarn install --frozen-lockfile; then \
      exit 0; \
    fi; \
    echo "yarn install failed (attempt ${attempt}); retrying..."; \
    sleep $((attempt * 5)); \
  done; \
  echo "yarn install failed after retries"; \
  exit 1

# Copy the rest of the application code
COPY . .

# Generate Prisma client in image so fresh CI-like containers have it available.
RUN yarn prisma:generate

# Expose the port the app runs on
EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1

# Run production server; compose overrides this to include build step.
CMD ["yarn", "start"]
