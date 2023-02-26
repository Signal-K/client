# This file is based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:18-bullseye AS base

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

RUN yarn set version berry

COPY package.json yarn.lock* ./
COPY .yarn/ ./.yarn

ENV YARN_ENABLE_IMMUTABLE_INSTALLS false
RUN yarn install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY . .

RUN yarn set version berry
RUN yarn install
RUN yarn build

# CMD "/bin/sh"
CMD ["yarn", "run", "dev"]

# Production image, copy all the files and run next
# FROM base AS runner
# WORKDIR /app

# ENV NODE_ENV production

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# COPY --from=builder /app/public ./public

# # Automatically leverage output traces to reduce image size
# # https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# USER nextjs
# EXPOSE 3000
# ENV PORT 3000

# CMD ["yarn", "node", "server.js"]

