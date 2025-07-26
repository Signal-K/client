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

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# For production, start the built application
CMD ["yarn", "start"]