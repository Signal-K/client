# Use official Go runtime as base image
FROM golang:1.23-alpine

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy all source files
COPY . .

# Build the notification service
RUN go build -o push-notifications main.go

# Make sure the binary is executable
RUN chmod +x push-notifications

# Default command
CMD ["./push-notifications"]