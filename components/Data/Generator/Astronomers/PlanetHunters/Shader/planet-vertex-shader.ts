export const planetVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  uniform float time;
  uniform float surfaceRoughness;
  uniform float mountainHeight;
  uniform float isGaseous;
  uniform int soilType;
  uniform int soilTexture;
  uniform float landmarkPositions[30]; // Support up to 10 landmarks (x,y,z for each)
  uniform float landmarkInfluences[40]; // Support up to 10 landmarks (radius,height,roughness,type for each)
  uniform int landmarkCount;
  
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

  // Fractal Brownian Motion with reduced octaves for less fuzziness
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

  // Calculate landmark terrain influence
  vec2 calculateLandmarkInfluence(vec3 position) {
    float totalHeight = 0.0;
    float totalRoughness = 0.0;
    float totalWeight = 0.0;
    
    for (int i = 0; i < 10; i++) {
      if (i >= landmarkCount) break;
      
      // Get landmark position from flat array (3 floats per landmark)
      int posIndex = i * 3;
      vec3 landmarkPos = vec3(
        landmarkPositions[posIndex],
        landmarkPositions[posIndex + 1],
        landmarkPositions[posIndex + 2]
      );
      
      // Get landmark influence from flat array (4 floats per landmark)
      int infIndex = i * 4;
      float radius = landmarkInfluences[infIndex];
      float height = landmarkInfluences[infIndex + 1];
      float roughness = landmarkInfluences[infIndex + 2];
      float type = landmarkInfluences[infIndex + 3];
      
      // Calculate distance to landmark
      float distance = length(position - landmarkPos);
      
      // If within influence radius
      if (distance <= radius) {
        // Calculate weight based on distance (closer = stronger influence)
        float weight = 1.0 - (distance / radius);
        float heightInfluence = 0.0;
        
        // Different influence types have different height profiles
        if (type < 0.5) {
          // Crater: depression with raised rim
          float rimFactor = distance / radius;
          if (rimFactor > 0.8) {
            heightInfluence = height * 0.5 * (1.0 - (rimFactor - 0.8) * 5.0);
          } else {
            heightInfluence = height * (distance / radius);
          }
        } 
        else if (type < 1.5) {
          // Mountain: raised area that tapers off with distance
          heightInfluence = height * pow(1.0 - distance / radius, 2.0);
        }
        else if (type < 2.5) {
          // Valley: depression that's deeper in the center
          heightInfluence = height * pow(1.0 - distance / radius, 1.5);
        }
        else if (type < 3.5) {
          // Volcano: steep cone with central depression
          float normalizedDist = distance / radius;
          if (normalizedDist < 0.2) {
            // Central depression (caldera)
            heightInfluence = height * -0.3;
          } else {
            // Cone shape
            heightInfluence = height * pow(1.0 - normalizedDist, 1.2);
          }
        }
        else if (type < 4.5) {
          // Ice cap: gentle dome with smooth edges
          heightInfluence = height * pow(cos(3.14159 * distance / radius / 2.0), 2.0);
        }
        else if (type < 5.5) {
          // Ocean: depression with flat bottom
          heightInfluence = height * min(1.0, distance / (radius * 0.2));
        }
        else {
          // Custom or undefined: simple linear falloff
          heightInfluence = height * weight;
        }
        
        // Add weighted contributions
        totalHeight += heightInfluence * weight;
        totalRoughness += roughness * weight;
        totalWeight += weight;
      }
    }
    
    // Normalize by total weight if any landmarks had influence
    if (totalWeight > 0.0) {
      return vec2(totalHeight / totalWeight, totalRoughness / totalWeight);
    }
    
    return vec2(0.0, 0.0);
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;
    
    vec3 pos = position;
    float elevation = 0.0;
    
    if (isGaseous > 0.5) {
      // Gas giant features
      float bands = sin(pos.y * 10.0 + time * 0.1) * 0.5;
      float storms = snoise(pos * vec3(2.0, 8.0, 2.0) + time * 0.15) * 0.5;
      float cyclones = snoise(pos * vec3(4.0, 1.0, 4.0) + time * 0.05) * 0.25;
      
      elevation = mix(bands, storms, 0.5) + cyclones;
      elevation *= 0.05; // Reduced distortion for gas giants
      
      // Apply landmark influences (storms, etc.)
      vec2 landmarkEffect = calculateLandmarkInfluence(normalize(pos));
      elevation += landmarkEffect.x * 0.5; // Reduced effect for gas giants
    } else {
      // Terrestrial features - use FBM with fewer octaves for less fuzziness
      float baseNoise = fbm(pos * surfaceRoughness + time * 0.01, 5);
    
      // Apply mountain height
      baseNoise *= mountainHeight;
      
      // Apply soil texture with reduced intensity
      float textureDetail = getSoilTexture(pos, soilTexture) * 0.7;
      
      // Adjust texture based on soil type
      if (soilType == 2) { // volcanic
        textureDetail *= 1.5;
      } else if (soilType == 1) { // sandy
        textureDetail *= 0.7;
      }
      
      elevation = baseNoise - textureDetail;
      
      // Apply landmark influences
      vec2 landmarkEffect = calculateLandmarkInfluence(normalize(pos));
      elevation += landmarkEffect.x;
      
      // Add additional roughness from landmarks
      if (landmarkEffect.y > 0.0) {
        float additionalRoughness = snoise(pos * 20.0 * landmarkEffect.y) * landmarkEffect.y * 0.2;
        elevation += additionalRoughness;
      }
      
      elevation *= 0.08; // Scale for terrestrial planets
    }
    
    vElevation = elevation;
    
    // Apply displacement
    pos += normal * elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`