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

# Set default environment variables for the build phase to prevent prerendering errors.
# These will be baked into the client-side bundle if not overridden during build.
# At runtime, the server-side will use the actual environment variables.
ENV NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-key-for-build

# Generate Prisma client and build app into the image layer.
RUN yarn prisma:generate && yarn build

# Expose the port the app runs on
EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1

CMD ["yarn", "start"]
