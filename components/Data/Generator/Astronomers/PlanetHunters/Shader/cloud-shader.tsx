export const cloudVertexShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normal;
    
    // Add some movement to the clouds
    vec3 pos = position;
    pos += normal * sin(pos.x * 10.0 + time * 0.5) * 0.005;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const cloudFragmentShader = `
  uniform float time;
  uniform float cloudCount;
  varying vec2 vUv;
  varying vec3 vNormal;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    
    // Create cloud-like patterns
    float noise = rand(uv + time * 0.1) * 0.5 + 0.5;
    noise += rand(uv * 2.0 - time * 0.05) * 0.25;
    noise += rand(uv * 4.0 + time * 0.1) * 0.125;
    noise /= 1.875;
    
    // Adjust cloud coverage based on cloudCount
    float coverage = cloudCount / 100.0;
    noise = smoothstep(0.5 - coverage * 0.4, 0.6, noise);
    
    // Create holes in the clouds
    float holes = rand(uv * 8.0 - time * 0.02);
    noise *= smoothstep(0.4, 0.6, holes);
    
    // Fade out at the edges for a more natural look
    float fadeEdges = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    noise *= fadeEdges;
    
    gl_FragColor = vec4(1.0, 1.0, 1.0, noise * 0.5);
  }
`