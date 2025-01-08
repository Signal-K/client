declare module 'canvas-to-image' {
    export default function canvasToImage(
      canvas: HTMLCanvasElement,
      options?: {
        name?: string;
        type?: 'png' | 'jpeg' | 'bmp';
        quality?: number;
      }
    ): void;
}  