# Use the official Node.js image
FROM node:22-bullseye

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies with retries to handle transient registry failures.
# We remove 'yarn cache clean' as it invalidates the Docker layer cache locally.
RUN set -eux; \
  for attempt in 1 2 3; do \
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

# Set a non-secret PocketBase URL for the build phase. Runtime server requests
# use the deployment-provided POCKETBASE_URL and admin credentials.
ENV POCKETBASE_URL=http://localhost:8095

RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "start"]
