export function generateNoise(
  width: number,
  height: number,
  scale: number
): number[][] {
  const noise = Array.from({ length: width }, () =>
    Array.from({ length: height }, () => 0)
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sampleX = x / scale;
      const sampleY = y / scale;

      let amplitude = 1;
      let frequency = 1;
      let noiseHeight = 0;

      // Add multiple octaves of noise
      for (let i = 0; i < 4; i++) {
        const perlinValue =
          Math.sin(sampleX * frequency) * Math.cos(sampleY * frequency);
        noiseHeight += perlinValue * amplitude;

        amplitude *= 0.5;
        frequency *= 2;
      }

      noise[x][y] = noiseHeight;
    }
  }

  return noise;
};