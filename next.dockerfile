# Use the official Node.js image
FROM node:18-bullseye

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Generate Drizzle types and run migrations (if needed)
# Note: This requires DATABASE_URL to be available at build time for type generation
# RUN yarn db:generate

# Expose the port the app runs on
EXPOSE 3000

# For development with hot-reloading
CMD ["yarn", "dev"]