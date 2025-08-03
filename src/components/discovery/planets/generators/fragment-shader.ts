export const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  varying vec3 vOrigPosition;
  
  uniform float time;
  uniform float isGaseous;
  uniform float liquidHeight;
  uniform float temperature;
  uniform float biomass;
  uniform float debugMode;
  uniform float seed;
  uniform float continentSize;
  uniform float continentCount;
  
  // Visibility toggles for debug mode
  uniform vec4 visibleTerrains; // x: ocean, y: beach, z: lowland, w: midland
  uniform vec4 visibleTerrains2; // x: highland, y: mountain, z: snow, w: unused
  
  uniform vec3 atmosphereColor;
  uniform vec3 oceanColor;
  uniform vec3 oceanPatternColor;
  uniform vec3 beachColor;
  uniform vec3 lowlandColor;
  uniform vec3 midlandColor;
  uniform vec3 highlandColor;
  uniform vec3 mountainColor;
  uniform vec3 snowColor;
  
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

  // Generate continent mask - same as in vertex shader
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
  float getTextureDetail(vec3 position, float scale, float intensity) {
    float detail = fbm(position * scale, 3) * intensity;
    return detail;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - abs(dot(normalize(vPosition), normal)), 2.0);
    
    vec3 finalColor;
    
    if (isGaseous > 0.5) {
      // Gas giant coloring
      float bands = sin(vPosition.y * 10.0 + time * 0.1) * 0.5 + 0.5;
      
      // Add more detailed texture to gas bands
      float bandDetail = getTextureDetail(vPosition * 5.0, 10.0, 0.3);
      bands = bands + bandDetail * 0.2;
      
      // Create color bands
      vec3 bandColor1 = atmosphereColor * 0.8;
      vec3 bandColor2 = atmosphereColor * 1.2;
      vec3 bandColor = mix(bandColor1, bandColor2, bands);
      
      // Add storm features
      float stormPattern = snoise(vPosition * vec3(8.0, 2.0, 8.0) + time * 0.1);
      float stormDetail = getTextureDetail(vPosition * 15.0, 20.0, 0.5);
      stormPattern = stormPattern + stormDetail * 0.3;
      
      vec3 stormColor = vec3(1.0, 1.0, 0.9) * smoothstep(0.6, 0.8, stormPattern);
      
      finalColor = mix(bandColor, stormColor, smoothstep(0.6, 0.8, stormPattern) * 0.5);
      
      // Add swirling patterns
      float swirl = snoise(vPosition * 3.0 + vec3(time * 0.02, time * 0.01, 0.0)) * 0.2;
      finalColor = mix(finalColor, bandColor * 1.3, swirl);
      
      // Add atmosphere glow
      finalColor = mix(finalColor, atmosphereColor, fresnel * 0.5);
    } else {
      // Terrestrial planet coloring
      float height = vElevation + 0.5; // Normalize to 0-1 range approximately
      
      // Get continent mask for sharp land/water boundaries
      float continentMask = generateContinents(normalize(vOrigPosition));
      
      // Ocean pattern with enhanced detail
      vec3 oceanPos = vOrigPosition * 20.0 + vec3(time * 0.05, 0.0, 0.0);
      float oceanPattern = snoise(oceanPos) * 0.5 + 0.5;
      float oceanDetail = getTextureDetail(vOrigPosition * 30.0, 50.0, 0.2);
      oceanPattern = oceanPattern + oceanDetail;
      
      // Beach width
      float beachWidth = 0.03;
      
      // Determine color based on height and continent mask
      vec3 terrainColor;
      
      if (debugMode > 0.5) {
        // Debug mode - show distinct terrain levels with visibility toggles
        if (height < liquidHeight) {
          // Ocean
          terrainColor = visibleTerrains.x > 0.5 ? oceanColor : vec3(0.0, 0.0, 0.0);
        } else if (height < liquidHeight + beachWidth) {
          // Beach
          terrainColor = visibleTerrains.y > 0.5 ? beachColor : vec3(0.0, 0.0, 0.0);
        } else if (height < liquidHeight + 0.15) {
          // Lowland
          terrainColor = visibleTerrains.z > 0.5 ? lowlandColor : vec3(0.0, 0.0, 0.0);
        } else if (height < liquidHeight + 0.3) {
          // Midland
          terrainColor = visibleTerrains.w > 0.5 ? midlandColor : vec3(0.0, 0.0, 0.0);
        } else if (height < liquidHeight + 0.45) {
          // Highland
          terrainColor = visibleTerrains2.x > 0.5 ? highlandColor : vec3(0.0, 0.0, 0.0);
        } else if (height < liquidHeight + 0.6) {
          // Mountain
          terrainColor = visibleTerrains2.y > 0.5 ? mountainColor : vec3(0.0, 0.0, 0.0);
        } else {
          // Snow
          terrainColor = visibleTerrains2.z > 0.5 ? snowColor : vec3(0.0, 0.0, 0.0);
        }
      } else {
        // Normal rendering with smooth transitions and sharp coastlines
        if (continentMask < 0.2 || height < liquidHeight - 0.02) {
          // Deep ocean
          vec3 baseOceanColor = mix(oceanColor, oceanPatternColor, oceanPattern * 0.3);
          float depth = 1.0 - (height / liquidHeight);
          terrainColor = mix(baseOceanColor * 1.2, baseOceanColor * 0.7, depth);
          
          // Add waves and more detailed ocean texture
          float waves = snoise(vPosition * 50.0 + vec3(time * 0.2, 0.0, 0.0)) * 0.02;
          float currentPattern = snoise(vPosition * 20.0 + vec3(time * 0.1, time * 0.05, 0.0)) * 0.03;
          terrainColor += vec3(waves + currentPattern);
        } else if (height < liquidHeight + beachWidth) {
          // Beach/shoreline transition
          float beachBlend = smoothstep(liquidHeight, liquidHeight + beachWidth, height);
          terrainColor = mix(oceanColor, beachColor, beachBlend);
          
          // Add beach texture
          float sandRipples = snoise(vOrigPosition * 100.0) * 0.05;
          terrainColor += vec3(sandRipples);
        } else {
          // Land - normalize height above water level
          float landHeight = (height - liquidHeight) / 0.5; // Scale to 0-1 for land
          
          // Add more detailed terrain texture
          float terrainDetail = getTextureDetail(vOrigPosition * 50.0, 100.0, 0.15);
          float terrainNoise = fbm(vOrigPosition * 10.0 + vec3(seed * 5.0), 2) * 0.1 + terrainDetail;
          
          // Temperature affects snow line
          float snowLine = 0.8 - (temperature / 700.0) * 0.4;
          
          if (landHeight > snowLine) {
            // Snow caps
            float snowBlend = smoothstep(snowLine, snowLine + 0.1, landHeight);
            terrainColor = mix(mountainColor, snowColor, snowBlend);
            
            // Add snow texture
            float snowDetail = snoise(vOrigPosition * 80.0) * 0.05;
            terrainColor += vec3(snowDetail);
          } else if (landHeight < 0.25) {
            // Lowland - transition from beach to lowland
            float lowlandBlend = smoothstep(0.0, 0.25, landHeight + terrainNoise);
            terrainColor = mix(beachColor, lowlandColor, lowlandBlend);
            
            // Add lowland texture
            float grassDetail = snoise(vOrigPosition * 120.0) * 0.05;
            terrainColor += vec3(0.0, grassDetail, 0.0);
          } else if (landHeight < 0.5) {
            // Midland
            float midlandBlend = smoothstep(0.25, 0.5, landHeight + terrainNoise);
            terrainColor = mix(lowlandColor, midlandColor, midlandBlend);
            
            // Add midland texture
            float forestDetail = snoise(vOrigPosition * 100.0) * 0.05;
            terrainColor += vec3(0.0, forestDetail, 0.0);
          } else if (landHeight < 0.75) {
            // Highland
            float highlandBlend = smoothstep(0.5, 0.75, landHeight + terrainNoise);
            terrainColor = mix(midlandColor, highlandColor, highlandBlend);
            
            // Add highland texture
            float rockDetail = snoise(vOrigPosition * 80.0) * 0.05;
            terrainColor += vec3(rockDetail * 0.5, rockDetail * 0.3, 0.0);
          } else {
            // Mountain
            float mountainBlend = smoothstep(0.75, 0.9, landHeight + terrainNoise);
            terrainColor = mix(highlandColor, mountainColor, mountainBlend);
            
            // Add mountain texture
            float peakDetail = snoise(vOrigPosition * 150.0) * 0.1;
            terrainColor += vec3(peakDetail);
          }
          
          // Adjust color based on temperature
          float tempFactor = clamp((temperature - 50.0) / 650.0, 0.0, 1.0);
          if (tempFactor < 0.3 && landHeight > 0.6) {
            // Cold - add ice/snow to high elevations
            float snowAmount = smoothstep(0.6, 0.8, landHeight);
            terrainColor = mix(terrainColor, snowColor, snowAmount);
          } else if (tempFactor > 0.7) {
            // Hot - more reddish/desert colors
            terrainColor = mix(terrainColor, vec3(0.8, 0.6, 0.4), 0.3);
          }
          
          // Add biomass (vegetation) to appropriate areas
          if (biomass > 0.0 && tempFactor > 0.2 && tempFactor < 0.8) {
            float vegetationAmount = biomass * smoothstep(0.1, 0.4, landHeight) * (1.0 - smoothstep(0.6, 0.9, landHeight));
            
            // Vegetation detail noise
            float vegDetail = fbm(vOrigPosition * 15.0 + vec3(seed * 7.0), 2) * 0.5 + 0.5;
            vegetationAmount *= vegDetail;
            
            // Adjust vegetation color based on temperature
            vec3 vegetationColor = mix(vec3(0.1, 0.5, 0.1), vec3(0.2, 0.6, 0.2), tempFactor); // Green
            terrainColor = mix(terrainColor, vegetationColor, vegetationAmount);
          }
        }
      }
      
      // Add atmosphere at edges
      finalColor = mix(terrainColor, atmosphereColor, fresnel * 0.4);
      
      // Add clouds
      float cloudCoverage = 0.3;
      float cloudSpeed = 0.01;
      vec3 cloudPos = vOrigPosition * 2.0 + vec3(time * cloudSpeed, 0.0, 0.0);
      float cloudNoise = fbm(cloudPos + vec3(seed * 9.0), 4);
      float cloudDetail = getTextureDetail(cloudPos * 2.0, 5.0, 0.2);
      float clouds = smoothstep(0.4, 0.6, cloudNoise + cloudDetail) * cloudCoverage;
      
      // Only add clouds above land or near coastlines
      if (height > liquidHeight - 0.05) {
        finalColor = mix(finalColor, vec3(1.0), clouds * 0.7);
      }
    }
    
    // Add lighting
    float light = dot(normal, normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;
    finalColor *= light;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`