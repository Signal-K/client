name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Setup environment
        run: |
          echo "SKIP_USER_CREATION_TESTS=true" >> $GITHUB_ENV
          echo "NODE_ENV=test" >> $GITHUB_ENV

      - name: Build application
        run: yarn build

      - name: Start application
        run: |
          yarn start &
          sleep 10
        env:
          NODE_ENV: production

      - name: Run E2E tests
        run: yarn test:e2e:headless
        env:
          SKIP_USER_CREATION_TESTS: true

      - name: Upload cypress screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload cypress videos
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos
