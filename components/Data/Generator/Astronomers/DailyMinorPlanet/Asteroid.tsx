import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createNoise3D } from "simplex-noise"

export function Asteroid({ metallic }: { metallic: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const noise3D = useMemo(() => createNoise3D(), [])

  // Generate geometry with noise-based displacement
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 4)
    const positions = geo.attributes.position
    const vector = new THREE.Vector3()

    for (let i = 0; i < positions.count; i++) {
      vector.fromBufferAttribute(positions, i)
      const noise = noise3D(vector.x * 2, vector.y * 2, vector.z * 2)
      vector.normalize().multiplyScalar(1 + 0.3 * noise)
      positions.setXYZ(i, vector.x, vector.y, vector.z)
    }

    geo.computeVertexNormals()
    return geo
  }, [noise3D])

  // Interpolate between rocky and metallic materials based on slider
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color().lerpColors(
        new THREE.Color("#8B7355"), // Rocky brown
        new THREE.Color("#A8A8A8"), // Metallic gray
        metallic
      ),
      metalness: THREE.MathUtils.lerp(0.2, 0.8, metallic),
      roughness: THREE.MathUtils.lerp(0.8, 0.3, metallic),
    })
  }, [metallic])

  // Slow rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </>
  );
};