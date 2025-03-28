name: Build Next.js Application

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
    name: Build Next.js App

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18' 

      - name: Install dependencies
        run: npm install

      - name: Build the app
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: nextjs-build
          path: .next