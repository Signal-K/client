# Use the official Node.js image
FROM node:18-bullseye

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install
# RUN yarn build

# Copy the rest of the application code
COPY . .

# For hot-reloading, you can use development mode
CMD ["yarn", "dev"]