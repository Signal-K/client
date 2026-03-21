"use client";

// Pure CSS star field — 3 depth layers, no JS animation, no canvas.
// Stars are generated once (stable across renders) using a seeded pattern.

const LAYERS = [
  { count: 60, size: 1,   opacity: 0.4, duration: 120 }, // far
  { count: 35, size: 1.5, opacity: 0.6, duration: 80  }, // mid
  { count: 18, size: 2,   opacity: 0.8, duration: 50  }, // near
];

// Deterministic pseudo-random from index
function pseudo(n: number, salt: number) {
  const x = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {LAYERS.map((layer, li) =>
        Array.from({ length: layer.count }, (_, i) => {
          const x = pseudo(i, li * 10) * 100;
          const y = pseudo(i, li * 20 + 1) * 100;
          const delay = pseudo(i, li * 30 + 2) * layer.duration;
          const twinkle = pseudo(i, li * 40 + 3) > 0.7;
          return (
            <span
              key={`${li}-${i}`}
              className={twinkle ? "animate-pulse" : undefined}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: layer.size,
                height: layer.size,
                borderRadius: "50%",
                background: "white",
                opacity: layer.opacity * (0.6 + pseudo(i, li * 50 + 4) * 0.4),
                animationDuration: twinkle ? `${2 + pseudo(i, li * 60 + 5) * 4}s` : undefined,
                animationDelay: twinkle ? `${delay % 6}s` : undefined,
                willChange: twinkle ? "opacity" : undefined,
              }}
            />
          );
        })
      )}
    </div>
  );
}
