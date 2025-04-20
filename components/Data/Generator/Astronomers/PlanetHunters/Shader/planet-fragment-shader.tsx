export const planetFragmentShader = `
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

  void main() {
    vec3 normal = normalize(vNormal);

    // Simple ambient occlusion based on elevation
    float ao = 1.0 - abs(vElevation) * 2.0;
    ao = max(0.4, ao);
    
    // Static light direction for consistent lighting
    vec3 lightDir = normalize(vec3(0.0, 0.3, 1.0));
    
    // Basic lighting calculation - fixed intensity
    float lightFactor = 0.8;
  
    vec3 color;
  
    if (isGaseous > 0.5) {
      // Gas giant coloring
      float bands = sin(vPosition.y * 10.0 + time * 0.1) * 0.5 + 0.5;
      float storms = smoothstep(0.4, 0.6, snoise(vPosition * 2.0 + time * 0.15));
      float cyclones = smoothstep(0.3, 0.7, snoise(vPosition * vec3(4.0, 1.0, 4.0) + time * 0.05));
    
      // Use ocean and land colors for gas giants
      color = mix(oceanColor, landColor, bands);
      color = mix(color, mountainColor, storms * 0.5);
      color = mix(color, vec3(1.0), cyclones * 0.2);
    
      // Add subtle atmospheric glow
      float atmosphere = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
      color += vec3(0.1, 0.15, 0.25) * atmosphere;
    } else {
      // Terrestrial coloring based on elevation
      float normalizedElevation = (vElevation + 0.08) / 0.16; // Normalize to 0-1 range
    
      if (liquidEnabled > 0.5 && normalizedElevation < waterLevel) {
        // Water areas
        float depth = (waterLevel - normalizedElevation) / waterLevel;
        color = mix(beachColor, oceanColor, depth * 2.0);
      
        // Add water effects
        float waterNoise = snoise(vPosition * 20.0 + time * 0.1) * 0.02;
        color += vec3(waterNoise);
      
        // Add water shine
        float fresnel = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
        float shine = pow(fresnel, 4.0) * 0.3;
        color += vec3(shine);
      } else {
        // Land areas
        if (normalizedElevation < waterLevel + 0.05) {
          // Beach/shore
          color = beachColor;
        } else if (normalizedElevation < waterLevel + 0.3) {
          // Regular terrain
          float t = (normalizedElevation - (waterLevel + 0.05)) / 0.25;
          color = mix(beachColor, landColor, t);
        } else {
          // Mountains
          float t = (normalizedElevation - (waterLevel + 0.3)) / 0.7;
          color = mix(landColor, mountainColor, t);
        }
      
        // Add soil type variations with reduced intensity
        float soilNoise = snoise(vPosition * 10.0) * 0.05;
      
        // Different soil type effects
        if (soilType == 0) { // rocky
          color *= 0.95 + soilNoise;
        } else if (soilType == 1) { // sandy
          color = mix(color, beachColor, 0.15);
          color += vec3(soilNoise * 0.15);
        } else if (soilType == 2) { // volcanic
          color *= 0.85;
          if (soilNoise > 0.03) color += vec3(0.08, 0.0, 0.0);
        } else if (soilType == 3) { // organic
          color = mix(color, vec3(0.2, 0.5, 0.2), 0.25);
        } else if (soilType == 4) { // dusty
          color = mix(color, vec3(0.6, 0.5, 0.4), 0.25);
        } else if (soilType == 5) { // frozen
          color = mix(color, vec3(0.8, 0.9, 1.0), 0.3);
          color += vec3(soilNoise * 0.2);
        } else if (soilType == 6) { // muddy
          color = mix(color, vec3(0.3, 0.2, 0.1), 0.3);
        }
      }
    }
    
    // Apply ambient occlusion
    color *= ao;
    
    // Apply fixed light intensity
    color *= lightFactor;
    
    gl_FragColor = vec4(color, 1.0);
  }
`