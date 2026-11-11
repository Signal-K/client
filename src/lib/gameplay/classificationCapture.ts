// Keeps the image a player classified, with their answer drawn on it, in
// PocketBase storage (bucket `media`, via /api/gameplay/storage/upload) — the
// same thing the annotator does with its canvas, for the screens where the
// player answers questions instead of drawing.
//
// Cost: one upload per classification (two when the source image lives on
// another host and has no copy in our storage). Nothing is read back.
// Failures never block the classification; the caller just gets no links.

export type CaptureMediaEntry = [string, string];

export interface ClassificationCapture {
  /** Links to append to the classification's `media`. */
  media: CaptureMediaEntry[];
  /** For classificationConfiguration.capture. */
  config: { source: string[]; image: string | null; annotated: string | null } | null;
}

const EMPTY: ClassificationCapture = { media: [], config: null };
const MAX_IMAGES = 6;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image load: ${url}`));
    // A copy cached from a non-CORS load would taint the canvas.
    img.src = url + (url.includes("?") ? "&" : "?") + "capture=1";
  });
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    } catch {
      resolve(null);
    }
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > width && line) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

/** True for images served from another origin (no copy of them in our storage). */
function isExternal(url: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(url, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * The images the player looked at side by side (image) and the same with
 * their answer written underneath (annotated).
 */
export async function composeAnswerCapture(
  imageUrls: string[],
  title: string,
  lines: string[],
): Promise<{ image: Blob | null; annotated: Blob | null }> {
  if (typeof document === "undefined") return { image: null, annotated: null };
  const urls = imageUrls.filter(Boolean).slice(0, MAX_IMAGES);
  const imgs = (await Promise.all(urls.map((u) => loadImage(u).catch(() => null)))).filter(
    (img): img is HTMLImageElement => !!img && img.naturalWidth > 0,
  );
  if (!imgs.length) return { image: null, annotated: null };

  // One row at the tallest image's height (capped so a strip stays sane).
  const rowH = Math.min(1200, Math.max(...imgs.map((i) => i.naturalHeight)));
  const widths = imgs.map((i) => Math.round((i.naturalWidth * rowH) / i.naturalHeight));
  const gap = imgs.length > 1 ? Math.round(rowH / 60) : 0;
  const w = widths.reduce((a, b) => a + b, 0) + gap * (imgs.length - 1);

  const paint = (canvas: HTMLCanvasElement, h: number) => {
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, w, h);
    let x = 0;
    imgs.forEach((img, i) => {
      ctx.drawImage(img, x, 0, widths[i], rowH);
      x += widths[i] + gap;
    });
    return ctx;
  };

  const plain = document.createElement("canvas");
  if (!paint(plain, rowH)) return { image: null, annotated: null };
  const image = await toBlob(plain);

  const marked = document.createElement("canvas");
  const font = Math.max(16, Math.round(w / 45));
  const pad = Math.round(font * 0.9);
  const probe = marked.getContext("2d");
  if (!probe) return { image, annotated: null };
  probe.font = `${font}px system-ui, sans-serif`;
  const body = lines.flatMap((l) => wrap(probe, l, w - pad * 2));
  const bandH = pad * 2 + Math.round(font * 1.3) * (body.length + 1);
  const ctx = paint(marked, rowH + bandH);
  if (!ctx) return { image, annotated: null };
  ctx.fillStyle = "#ffd60a";
  ctx.fillRect(0, rowH, w, Math.max(3, Math.round(font / 6)));
  ctx.textBaseline = "top";
  ctx.font = `600 ${font}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffd60a";
  ctx.fillText(title, pad, rowH + pad);
  ctx.font = `${font}px system-ui, sans-serif`;
  ctx.fillStyle = "#e6f0fa";
  body.forEach((line, i) => ctx.fillText(line, pad, rowH + pad + Math.round(font * 1.3) * (i + 1)));
  return { image, annotated: await toBlob(marked) };
}

async function upload(blob: Blob, userId: string, label: string): Promise<CaptureMediaEntry | null> {
  const fileName = `${Date.now()}-${userId}-${label}.png`;
  const form = new FormData();
  form.append("bucket", "media");
  form.append("file", new File([blob], fileName, { type: "image/png" }));
  form.append("fileName", fileName);
  try {
    const res = await fetch("/api/gameplay/storage/upload", { method: "POST", body: form });
    const payload = await res.json().catch(() => null);
    return res.ok && payload?.publicUrl ? [payload.publicUrl, fileName] : null;
  } catch {
    return null;
  }
}

/**
 * Draws and uploads the capture for an answer-only classification. Call it
 * before creating the classification and spread the result into the body.
 */
export async function captureClassification(opts: {
  userId: string | undefined | null;
  imageUrls: (string | null | undefined)[];
  title: string;
  lines: string[];
}): Promise<ClassificationCapture> {
  const urls = opts.imageUrls.filter((u): u is string => typeof u === "string" && u.length > 0);
  if (!opts.userId || !urls.length) return EMPTY;
  try {
    const { image, annotated } = await composeAnswerCapture(urls, opts.title, opts.lines.filter(Boolean));
    const media: CaptureMediaEntry[] = [];
    const marked = annotated ? await upload(annotated, opts.userId, "annotated-image") : null;
    if (marked) media.push(marked);
    // Our own storage already holds the originals; copy only outside images.
    const copy = image && urls.some(isExternal) ? await upload(image, opts.userId, "source-image") : null;
    if (copy) media.push(copy);
    return { media, config: { source: urls, image: copy?.[0] ?? null, annotated: marked?.[0] ?? null } };
  } catch {
    return EMPTY;
  }
}
