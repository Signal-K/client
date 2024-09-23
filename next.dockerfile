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

# Build the Next.js project
RUN yarn build

# Expose the Next.js port
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["yarn", "start"]