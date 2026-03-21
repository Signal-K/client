import type { ThreeElements } from '@react-three/fiber';
import type React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
