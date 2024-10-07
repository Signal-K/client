name: Docker Build

on:
  push:
    branches:
      - '**'
  pull_request:
    branches:
      - '**'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        with:
          submodules: true 

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1

      - name: Build Docker images
        run: docker-compose -f compose.yml build