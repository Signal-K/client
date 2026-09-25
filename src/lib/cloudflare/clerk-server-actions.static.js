// Static-export stand-in for @clerk/nextjs/dist/esm/app-router/server-actions.js
// (SSC-31). Exports cannot contain server actions. invalidateCacheAction only
// clears Next's server render cache after sign-in, and a static export has none.
export async function invalidateCacheAction() {}
