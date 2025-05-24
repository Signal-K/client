export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  varying vec3 vOrigPosition;
  
  uniform float time;
  uniform float surfaceRoughness;
  uniform float volcanicActivity;
  uniform float isGaseous;
  uniform float seed;
  uniform float continentSize;
  uniform float continentCount;
  uniform float noiseScale;
  
  // Simplex 3D Noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    i = mod(i, 289.0); 
    vec4 p = permute(permute(permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Fractal Brownian Motion
  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float persistence = 0.5;
    
    // Use a fixed seed for terrain to keep it static
    vec3 fixedPos = p + vec3(seed * 0.01);
    
    for (int i = 0; i < octaves; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(fixedPos * frequency);
      amplitude *= persistence;
      frequency *= 2.0;
    }
    
    return value;
  }

  // Generate continent mask
  float generateContinents(vec3 position) {
    // Use the seed to create different continent patterns
    vec3 seedOffset = vec3(seed * 0.1, seed * 0.2, seed * 0.3);
    
    // Base continent noise
    float continentNoise = 0.0;
    
    // Generate multiple continent centers
    for (float i = 0.0; i < 10.0; i++) {
      if (i >= continentCount) break;
      
      // Create a unique position for each continent center
      float angle1 = (i / continentCount) * 6.28 + seed * 0.1;
      float angle2 = (i / continentCount) * 3.14 + seed * 0.2;
      
      vec3 continentCenter = vec3(
        sin(angle1) * cos(angle2),
        sin(angle1) * sin(angle2),
        cos(angle1)
      );
      
      // Distance to continent center
      float dist = distance(position, continentCenter);
      
      // Continent shape with some noise
      float continentShape = smoothstep(continentSize, 0.0, dist);
      
      // Add some noise to the continent edges
      float edgeNoise = fbm(position * 2.0 + seedOffset + continentCenter, 3) * 0.5;
      
      // Combine
      continentNoise = max(continentNoise, continentShape + edgeNoise * 0.3);
    }
    
    // Add some small islands
    float islandNoise = fbm(position * 3.0 + seedOffset, 4) * 0.3;
    
    return clamp(continentNoise + islandNoise * 0.3, 0.0, 1.0);
  }

  // Enhanced texture detail function
  float getTextureDetail(vec3 position, float scale) {
    return fbm(position * scale, 3) * 0.05;
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;
    vOrigPosition = position;
    
    vec3 pos = position;
    float elevation = 0.0;
    
    if (isGaseous > 0.5) {
      // Gas giant features - keep these animated
      float bands = sin(pos.y * 10.0 + time * 0.1) * 0.5;
      float storms = snoise(pos * vec3(2.0, 8.0, 2.0) + time * 0.15) * 0.5;
      float cyclones = snoise(pos * vec3(4.0, 1.0, 4.0) + time * 0.05) * 0.25;
      
      // Add more detailed texture to gas giants
      float gasDetail = getTextureDetail(pos * 10.0, 20.0);
      
      elevation = mix(bands, storms, 0.5) + cyclones + gasDetail;
      elevation *= 0.05; // Reduced distortion for gas giants
    } else {
      // Generate continent mask
      float continentMask = generateContinents(normalize(position));
      
      // Generate detailed terrain only on continents
      float detailedTerrain = fbm(position * surfaceRoughness * noiseScale + vec3(seed), 5) * 0.5;
      
      // Add more micro-detail to terrain
      float microDetail = getTextureDetail(position * 50.0 * noiseScale, 100.0);
      detailedTerrain += microDetail;
      
      // Apply the continent mask to the terrain
      float maskedTerrain = detailedTerrain * continentMask;
      
      // Add some base terrain for underwater features
      float baseTerrain = fbm(position * 0.5 * noiseScale + vec3(seed * 2.0), 3) * 0.02;
      
      // Add volcanic features
      float volcanic = 0.0;
      if (volcanicActivity > 0.0) {
        volcanic = pow(fbm(position * 8.0 * noiseScale + vec3(seed * 3.0), 2), 3.0) * volcanicActivity * continentMask;
      }
      
      // Add ridges and cracks to terrain
      float ridges = 1.0 - abs(fbm(position * 12.0 * noiseScale + vec3(seed * 4.0), 3));
      ridges = pow(ridges, 3.0) * 0.15 * continentMask;
      
      // Combine all terrain features
      elevation = maskedTerrain * 0.15 + baseTerrain + volcanic * 0.1 + ridges * 0.05;
      
      // Make sure continents have a minimum height
      elevation = mix(baseTerrain, elevation, continentMask);
    }
    
    vElevation = elevation;
    
    // Apply displacement
    pos += normal * elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`