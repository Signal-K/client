export const stylizedFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  uniform vec3 oceanColor;
  uniform vec3 beachColor;
  uniform vec3 landColor;
  uniform vec3 mountainColor;
  uniform float time;
  uniform float waterLevel;
  uniform float isGaseous;
  uniform float liquidEnabled;
  uniform int soilType;
  uniform int soilTexture;
  uniform float surfaceRoughness;
  uniform float mountainHeight;
  
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
    
    for (int i = 0; i < octaves; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= persistence;
      frequency *= 2.0;
    }
    
    return value;
  }

  // Voronoi noise for cell-like patterns
  float voronoi(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    float minDist = 1.0;
    
    for(int z = -1; z <= 1; z++) {
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec3 cell = vec3(float(x), float(y), float(z));
          vec3 cellPosition = cell + snoise(i + cell) * 0.5;
          float dist = length(cellPosition - f);
          minDist = min(minDist, dist);
        }
      }
    }
    
    return minDist;
  }

  // Function to create stylized borders
  float borderEffect(vec3 position, float scale, float width) {
    float cell = voronoi(position * scale);
    return smoothstep(width - 0.05, width + 0.05, cell);
  }

  // Soil texture function with reduced intensity
  float getSoilTexture(vec3 pos, int textureType) {
    float detail = 0.0;
    
    // Scale and depth based on texture type
    float scale = 1.0;
    float depth = 0.05;
    
    if (textureType == 0) { // smooth
      scale = 5.0; depth = 0.01;
    } else if (textureType == 1) { // rough
      scale = 15.0; depth = 0.05;
    } else if (textureType == 2) { // cracked
      scale = 20.0; depth = 0.08;
      float crack1 = snoise(pos * scale * 2.0);
      float crack2 = snoise(pos * scale * 5.0);
      return (abs(crack1) < 0.1 ? depth * 1.5 : 0.0) + (abs(crack2) < 0.05 ? depth * 0.8 : 0.0);
    } else if (textureType == 3) { // layered
      scale = 12.0; depth = 0.04;
      float layer = snoise(pos * scale * 0.5);
      return sin(layer * 20.0) * depth * 0.8;
    } else if (textureType == 4) { // porous
      scale = 25.0; depth = 0.06;
      float pore = snoise(pos * scale * 4.0);
      return pore > 0.8 ? depth * 1.5 : 0.0;
    } else if (textureType == 5) { // grainy
      scale = 30.0; depth = 0.03;
      float grain1 = snoise(pos * scale * 8.0);
      float grain2 = snoise(pos * scale * 12.0);
      return grain1 * grain2 * depth;
    } else if (textureType == 6) { // crystalline
      scale = 18.0; depth = 0.07;
      float crystal = snoise(pos * scale * 3.0);
      return (crystal > 0.7 || crystal < -0.7) ? depth * 1.2 : 0.0;
    }
    
    // Default noise pattern
    float defaultNoise = snoise(pos * scale);
    return defaultNoise * depth * 0.5;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    float normalizedElevation = (vElevation + 0.08) / 0.16; // Normalize to 0-1 range
    
    // Create noise patterns at different scales for layering
    float largeNoise = snoise(vPosition * 2.0 + time * 0.02);
    float mediumNoise = snoise(vPosition * 5.0 + time * 0.05);
    float smallNoise = snoise(vPosition * 10.0);
    
    // Create cell patterns for terrain boundaries
    float cellBorders = borderEffect(vPosition, 3.0, 0.1);
    
    // Lighting setup - multiple light sources for better hemisphere coverage
    vec3 lightDir1 = normalize(vec3(0.5, 1.0, 0.5));
    vec3 lightDir2 = normalize(vec3(-0.5, -0.8, 0.2));
    
    // Calculate diffuse lighting from both light sources
    float diffuse1 = max(0.3, dot(normal, lightDir1));
    float diffuse2 = max(0.1, dot(normal, lightDir2) * 0.5); // Secondary light is dimmer
    
    // Combine lighting with ambient term
    float lightFactor = diffuse1 + diffuse2 + 0.2; // 0.2 is ambient light
    
    // Simple ambient occlusion based on elevation
    float ao = 1.0 - abs(vElevation) * 2.0;
    ao = max(0.4, ao);
    
    // Stylized topographical coloring
    vec3 color;
    
    if (isGaseous > 0.5) {
      // Gas giant stylized coloring - inspired by the first reference image
      float bands = sin(vPosition.y * 8.0) * 0.5 + 0.5;
      
      // Create swirling patterns
      float swirl = snoise(vec3(
        vPosition.x + sin(vPosition.y * 4.0 + time * 0.1) * 0.2,
        vPosition.y + cos(vPosition.x * 4.0 + time * 0.05) * 0.2,
        vPosition.z + time * 0.02
      ));
      
      // Base color from bands
      color = mix(
        vec3(0.7, 0.3, 0.1), // Orange-red
        vec3(0.9, 0.7, 0.3), // Yellow-orange
        bands
      );
      
      // Add swirl patterns
      color = mix(
        color,
        vec3(0.2, 0.1, 0.5), // Deep purple
        smoothstep(0.3, 0.7, swirl)
      );
      
      // Add storm spots
      float spots = smoothstep(0.7, 0.9, largeNoise);
      color = mix(color, vec3(0.9, 0.9, 1.0), spots * 0.5);
      
      // Add depth with noise-based shadows
      float depthNoise = snoise(vPosition * 3.0) * 0.3;
      color = mix(color, color * 0.7, depthNoise);
      
      // Add subtle atmospheric glow
      float atmosphere = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
      color += vec3(0.1, 0.15, 0.25) * atmosphere;
      
    } else {
      // Terrestrial planet stylized coloring - inspired by both reference images
      
      // Use terrain height to determine land vs water
      float heightWithNoise = normalizedElevation + (largeNoise * 0.2 - 0.1) * surfaceRoughness;
      
      if (liquidEnabled > 0.5 && heightWithNoise < waterLevel) {
        // Ocean areas - teal/turquoise like in the first reference image
        
        // Create depth variation
        float depth = (waterLevel - heightWithNoise) / waterLevel;
        depth = pow(depth, 0.5); // Adjust depth curve
        
        // Shallow water is more teal, deep water is darker blue (like second reference)
        vec3 shallowColor = vec3(0.2, 0.7, 0.6); // Teal color for shallow water
        vec3 deepColor = vec3(0.0, 0.4, 0.5);    // Darker blue for deep water
        
        // Mix colors based on depth
        color = mix(shallowColor, deepColor, depth);
        
        // Add wave patterns
        float waves = sin(vPosition.x * 50.0 + vPosition.z * 50.0 + time * 0.5) * 0.5 + 0.5;
        color = mix(color, color * 1.3, waves * 0.1);
        
        // Add current patterns
        float currents = snoise(vPosition * 8.0 + time * 0.1) * 0.5 + 0.5;
        color = mix(color, oceanColor * 0.9, currents * 0.1);
        
        // Add coastal patterns
        if (heightWithNoise > waterLevel - 0.05) {
          float coastalPattern = sin(vPosition.x * 80.0 + vPosition.z * 80.0) * 0.5 + 0.5;
          color = mix(color, beachColor, coastalPattern * 0.3);
        }
        
        // Add depth with bumps for waves
        float bumpDepth = snoise(vPosition * 20.0 + time * 0.2) * 0.05;
        color = mix(color, color * 1.2, bumpDepth);
        
        // Add water shine
        float fresnel = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
        float shine = pow(fresnel, 4.0) * 0.3;
        color += vec3(shine);
        
      } else {
        // Land areas with distinct terrain types - inspired by both reference images
        
        // Create terrain type based on noise and elevation
        float terrainType = largeNoise * 0.4 + heightWithNoise * 0.6;
        
        // Apply surface roughness to terrain transitions
        terrainType += mediumNoise * surfaceRoughness * 0.2;
        
        // Create distinct terrain regions with sharp boundaries like in first reference
        if (terrainType < 0.3) {
          // Lowlands - use beach color
          color = beachColor;
          
          // Add texture variation
          color *= 0.8 + smallNoise * 0.4;
          
        } else if (terrainType < 0.6) {
          // Mid-elevation - use land color
          color = landColor;
          
          // Add texture variation
          color *= 0.8 + mediumNoise * 0.4;
          
        } else {
          // Highlands - use mountain color
          color = mountainColor;
          
          // Add texture variation based on mountain height
          float mountainPattern = snoise(vPosition * 15.0) * mountainHeight;
          color = mix(color, color * 1.3, mountainPattern);
        }
        
        // Add terrain borders - purple borders like in first reference
        float borderIntensity = 1.0 - abs(terrainType - 0.3) * 20.0;
        borderIntensity = max(0.0, borderIntensity);
        borderIntensity += 1.0 - abs(terrainType - 0.6) * 20.0;
        borderIntensity = clamp(borderIntensity, 0.0, 1.0);
        
        // Purple borders like in first reference
        vec3 borderColor = vec3(0.5, 0.0, 0.8);
        color = mix(color, borderColor, borderIntensity * 0.7);
        
        // Add cell pattern borders for terrain division
        color = mix(color, borderColor, cellBorders * 0.5);
        
        // Add soil type variations
        if (soilType == 0) { // rocky
          color = mix(color, vec3(0.6, 0.6, 0.6), 0.2);
        } else if (soilType == 1) { // sandy
          color = mix(color, vec3(0.9, 0.8, 0.5), 0.2);
        } else if (soilType == 2) { // volcanic
          color = mix(color, vec3(0.5, 0.2, 0.1), 0.2);
        } else if (soilType == 3) { // organic
          color = mix(color, vec3(0.3, 0.5, 0.2), 0.2);
        } else if (soilType == 4) { // dusty
          color = mix(color, vec3(0.8, 0.7, 0.6), 0.2);
        } else if (soilType == 5) { // frozen
          color = mix(color, vec3(0.8, 0.9, 1.0), 0.2);
        } else if (soilType == 6) { // muddy
          color = mix(color, vec3(0.4, 0.3, 0.2), 0.2);
        }
        
        // Add soil texture details
        float textureDetail = getSoilTexture(vPosition, soilTexture) * 0.7;
        color = mix(color, color * 0.8, textureDetail);
      }
    }
    
    // Add ambient occlusion for depth
    color *= ao;
    
    // Add atmospheric rim lighting like in second reference
    float rimLight = 1.0 - max(0.0, dot(normal, normalize(vec3(0.0, 0.0, 1.0))));
    rimLight = pow(rimLight, 3.0);
    color = mix(color, vec3(0.6, 0.8, 1.0), rimLight * 0.3);
    
    // Apply lighting
    color *= lightFactor;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;