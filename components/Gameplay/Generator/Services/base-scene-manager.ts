export default interface SceneManager {
    scene: THREE.Scene;
    camera: THREE.Camera;
    init(canvas: HTMLCanvasElement): void;
    start(): void;
    stop(): void;
}