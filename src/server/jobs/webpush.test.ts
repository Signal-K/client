import { describe, expect, it, vi } from "vitest";

import { b64urlDecode, b64urlEncode, encryptPayload, sendWebPush, vapidToken, type PushTarget } from "./webpush";

// RFC 8291 section 5 / appendix A example.
const RFC = {
  plaintext: "When I grow up, I want to be a watermelon",
  asPrivate: "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw",
  asPublic: "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8",
  uaPublic: "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4",
  salt: "DGv6ra1nlYgDCS1FRnbzlw",
  authSecret: "BTBZMqHH6r4Tts7J_aSIgg",
  body:
    "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN",
};

async function importPrivate(d: string, publicKey: string, usage: "deriveBits" | "sign") {
  const point = b64urlDecode(publicKey);
  const jwk = { kty: "EC", crv: "P-256", d, x: b64urlEncode(point.slice(1, 33)), y: b64urlEncode(point.slice(33)) };
  const algorithm = usage === "sign" ? { name: "ECDSA", namedCurve: "P-256" } : { name: "ECDH", namedCurve: "P-256" };
  return crypto.subtle.importKey("jwk", jwk, algorithm, false, [usage]);
}

describe("encryptPayload", () => {
  it("matches the RFC 8291 example byte for byte", async () => {
    const target: PushTarget = { endpoint: "https://push.example.net/x", p256dh: RFC.uaPublic, auth: RFC.authSecret };
    const body = await encryptPayload(target, new TextEncoder().encode(RFC.plaintext), {
      salt: b64urlDecode(RFC.salt),
      senderKeys: { privateKey: await importPrivate(RFC.asPrivate, RFC.asPublic, "deriveBits"), publicKey: b64urlDecode(RFC.asPublic) },
    });
    expect(b64urlEncode(body)).toBe(RFC.body);
  });
});

async function vapidKeys() {
  const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
  const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const publicKey = b64urlEncode(await crypto.subtle.exportKey("raw", pair.publicKey));
  return { vapid: { publicKey, privateKey: jwk.d!, subject: "mailto:ops@example.test" }, verifyKey: pair.publicKey };
}

describe("vapidToken", () => {
  it("signs an ES256 JWT for the push service origin", async () => {
    const { vapid, verifyKey } = await vapidKeys();
    const token = await vapidToken("https://fcm.googleapis.com", vapid, 1_800_000_000);
    const [header, claims, signature] = token.split(".");
    expect(JSON.parse(new TextDecoder().decode(b64urlDecode(claims)))).toEqual({
      aud: "https://fcm.googleapis.com",
      exp: 1_800_000_000 + 12 * 3600,
      sub: "mailto:ops@example.test",
    });
    const valid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      verifyKey,
      b64urlDecode(signature),
      new TextEncoder().encode(`${header}.${claims}`),
    );
    expect(valid).toBe(true);
  });
});

describe("sendWebPush", () => {
  const target: PushTarget = { endpoint: "https://push.example.net/sub/1", p256dh: RFC.uaPublic, auth: RFC.authSecret };

  it.each([
    [201, "sent"],
    [410, "gone"],
    [404, "gone"],
    [429, "retry"],
    [503, "retry"],
    [400, "rejected"],
  ])("maps HTTP %i to %s", async (status, outcome) => {
    const { vapid } = await vapidKeys();
    const fetchImpl = vi.fn(async () => new Response("", { status }));
    const result = await sendWebPush(target, "{}", vapid, { fetchImpl: fetchImpl as unknown as typeof fetch, topic: "t1" });
    expect(result.outcome).toBe(outcome);
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit & { headers: Record<string, string> }];
    expect(init.headers["content-encoding"]).toBe("aes128gcm");
    expect(init.headers.authorization).toMatch(/^vapid t=[^.]+\.[^.]+\.[^,]+, k=/);
    expect(init.headers.topic).toBe("t1");
  });

  it("treats a network failure as retryable", async () => {
    const { vapid } = await vapidKeys();
    const fetchImpl = vi.fn(async () => {
      throw new Error("connect ETIMEDOUT");
    });
    expect(await sendWebPush(target, "{}", vapid, { fetchImpl: fetchImpl as unknown as typeof fetch })).toMatchObject({ outcome: "retry", status: null });
  });
});
