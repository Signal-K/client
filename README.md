This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Run in Docker

We have a Dockerfile, based on the example at https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile.  To build and run, you may use:

```
docker build . -t client
docker run --rm -it client
```

Alternatively, the sytizen/Server docker-compose.yml will build and run a client container.

Assuming:
``` 
project_root
  sytizen
    Server
  Client
```

You can simply run:
```
cd ../sytizen/Server && make run
```

### Notes

1. Although the current version of ethers 6 is in beta, it is not yet ready for our use.  For now, we stay on ethers 5.

2. Currently, the container completes `yarn build`, but runs `yarn dev`.  There is a commented section in Dockerfile for a production server.

3. There are some dependency warnings upon running `yarn install`.

4. It is important to use yarn berry (currently 3.4.1)  
```
yarn set version berry
```