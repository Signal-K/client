# Test Dockerfile for E2E testing with Cypress
FROM node:22-bullseye

# Install dependencies needed for Cypress
RUN apt-get update && apt-get install -y \
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

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with legacy peer deps for testing
RUN yarn install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables for testing
ENV NODE_ENV=test
ENV CYPRESS_CACHE_FOLDER=/app/.cypress
ENV CI=true

# Create Cypress cache directory
RUN mkdir -p /app/.cypress

# Default command (can be overridden in docker-compose)
CMD ["yarn", "dev"]
