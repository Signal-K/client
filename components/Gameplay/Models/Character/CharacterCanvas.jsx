import { Canvas } from "@react-three/fiber";
import Experience from "./Woman";
import Interface from "./Interface";

export default function CharacterCanvas () {
    return (
        <>
            <Canvas
                camera={{ position: [1, 1.5, 2.5], fov: 50 }}
                shadows
                gl={{ preserveDrawingBuffer: true }}
            >
                <Experience />
            </Canvas>
            <Interface />
        </>
    )
}