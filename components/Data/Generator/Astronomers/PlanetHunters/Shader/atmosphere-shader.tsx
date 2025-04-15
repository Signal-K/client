export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec2 vUv;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const atmosphereFragmentShader = `
  uniform float time;
  uniform vec3 color;
  uniform float strength;
  
  varying vec3 vNormal;
  varying vec2 vUv;
  
  void main() {
    float intensity = pow(0.7 - abs(dot(vNormal, vec3(0, 0, 1))), 1.5);
    vec3 atmosphereColor = color * intensity * strength;
    gl_FragColor = vec4(atmosphereColor, intensity * strength * 0.7);
  }
`