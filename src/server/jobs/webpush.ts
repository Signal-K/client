// Web Push for the Worker (SSC-39): VAPID (RFC 8292) and aes128gcm payload
// encryption (RFC 8291 / RFC 8188) on WebCrypto. The `web-push` npm package
// relies on Node's https and ECDH APIs; this runs natively in workerd and in
// Node 20+.

export type PushTarget = { endpoint: string; p256dh: string; auth: string };
export type VapidConfig = { publicKey: string; privateKey: string; subject: string };

export type PushResult =
  | { endpoint: string; outcome: "sent" }
  /** 404/410: the browser dropped the subscription; delete it. */
  | { endpoint: string; outcome: "gone"; status: number }
  /** 429/5xx/network: worth retrying later. */
  | { endpoint: string; outcome: "retry"; status: number | null; error: string }
  /** Any other 4xx: retrying will not help. */
  | { endpoint: string; outcome: "rejected"; status: number; error: string };

const encoder = new TextEncoder();

type Bytes = Uint8Array<ArrayBuffer>;

export function b64urlDecode(value: string): Bytes {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function b64urlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const concat = (...parts: Uint8Array[]): Bytes => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

async function hkdf(salt: Bytes, ikm: Bytes, info: Bytes, bytes: number): Promise<Bytes> {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, bytes * 8));
}

/** An uncompressed P-256 point (0x04 || x || y) as JWK coordinates. */
function pointToJwk(point: Bytes) {
  if (point.length !== 65 || point[0] !== 4) throw new Error("Expected an uncompressed P-256 public key");
  return { kty: "EC", crv: "P-256", x: b64urlEncode(point.slice(1, 33)), y: b64urlEncode(point.slice(33)) };
}

export type EncryptOptions = {
  /** Test hooks for the RFC 8291 example; random in production. */
  salt?: Bytes;
  senderKeys?: { privateKey: CryptoKey; publicKey: Bytes };
};

/** RFC 8291 message encryption, one aes128gcm record. */
export async function encryptPayload(target: PushTarget, payload: Uint8Array, options: EncryptOptions = {}): Promise<Bytes> {
  const uaPublic = b64urlDecode(target.p256dh);
  const authSecret = b64urlDecode(target.auth);
  const salt = options.salt ?? crypto.getRandomValues(new Uint8Array(16));

  let sender = options.senderKeys;
  if (!sender) {
    const pair = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])) as CryptoKeyPair;
    sender = { privateKey: pair.privateKey, publicKey: new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey)) };
  }

  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, sender.privateKey, 256));

  const keyInfo = concat(encoder.encode("WebPush: info\0"), uaPublic, sender.publicKey);
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);
  const cek = await hkdf(salt, ikm, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, encoder.encode("Content-Encoding: nonce\0"), 12);

  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  // 0x02 marks the last (only) record; no padding.
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, concat(payload, new Uint8Array([2]))));

  const header = new Uint8Array(16 + 4 + 1 + sender.publicKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096);
  header[20] = sender.publicKey.length;
  header.set(sender.publicKey, 21);
  return concat(header, ciphertext);
}

let signingKey: { privateKey: string; key: Promise<CryptoKey> } | null = null;
const tokenCache = new Map<string, { token: string; expires: number }>();

function vapidSigningKey(vapid: VapidConfig): Promise<CryptoKey> {
  if (signingKey?.privateKey !== vapid.privateKey) {
    const jwk = { ...pointToJwk(b64urlDecode(vapid.publicKey)), d: vapid.privateKey };
    signingKey = {
      privateKey: vapid.privateKey,
      key: crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]),
    };
  }
  return signingKey.key;
}

/** VAPID JWT for a push service origin; cached per isolate until near expiry. */
export async function vapidToken(audience: string, vapid: VapidConfig, now = Math.floor(Date.now() / 1000)): Promise<string> {
  const cached = tokenCache.get(audience);
  if (cached && cached.expires - 600 > now) return cached.token;

  const expires = now + 12 * 60 * 60;
  const header = b64urlEncode(encoder.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64urlEncode(encoder.encode(JSON.stringify({ aud: audience, exp: expires, sub: vapid.subject })));
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, await vapidSigningKey(vapid), encoder.encode(`${header}.${claims}`));
  const token = `${header}.${claims}.${b64urlEncode(signature)}`;
  tokenCache.set(audience, { token, expires });
  return token;
}

export type SendOptions = {
  /** Seconds the push service keeps an undelivered message. */
  ttl?: number;
  /** Replaces an undelivered message with the same topic (≤32 URL-safe chars). */
  topic?: string;
  fetchImpl?: typeof fetch;
};

export async function sendWebPush(target: PushTarget, payload: string, vapid: VapidConfig, options: SendOptions = {}): Promise<PushResult> {
  const endpoint = target.endpoint;
  try {
    const url = new URL(endpoint);
    const body = await encryptPayload(target, encoder.encode(payload));
    const headers: Record<string, string> = {
      authorization: `vapid t=${await vapidToken(url.origin, vapid)}, k=${vapid.publicKey}`,
      "content-encoding": "aes128gcm",
      "content-type": "application/octet-stream",
      ttl: String(options.ttl ?? 24 * 60 * 60),
      urgency: "normal",
    };
    if (options.topic) headers.topic = options.topic;

    const response = await (options.fetchImpl ?? fetch)(endpoint, { method: "POST", headers, body });
    if (response.status >= 200 && response.status < 300) return { endpoint, outcome: "sent" };
    const error = (await response.text().catch(() => "")).slice(0, 200) || response.statusText;
    if (response.status === 404 || response.status === 410) return { endpoint, outcome: "gone", status: response.status };
    if (response.status === 429 || response.status >= 500) return { endpoint, outcome: "retry", status: response.status, error };
    return { endpoint, outcome: "rejected", status: response.status, error };
  } catch (error) {
    return { endpoint, outcome: "retry", status: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Push `Topic` values must be ≤32 chars of the URL-safe base64 alphabet. */
export function pushTopic(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 32);
}
