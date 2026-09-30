// Static-export stand-in for @clerk/nextjs/dist/esm/app-router/keyless-actions.js
// (SSC-31). Keyless mode is Clerk's no-publishable-key development flow; the
// Cloudflare build always has a publishable key, so these are never reached.
export async function syncKeylessConfigAction() {}
export async function createOrReadKeylessAction() {
  return null;
}
export async function deleteKeylessAction() {}
