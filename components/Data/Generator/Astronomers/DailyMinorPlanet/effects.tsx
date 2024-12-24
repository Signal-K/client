"use client";

import { Effect } from "postprocessing";
import { forwardRef } from "react";
import { extend, useThree } from "@react-three/fiber";
import { EffectComposer, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Uniform, WebGLRenderer } from "three";

// Custom grain effect to match telescope image
class GrainEffect extends Effect {
  constructor({ blendFunction = BlendFunction.MULTIPLY } = {}) {
    super(
      "GrainEffect",
      /* glsl */ `
      uniform float time;

      float random(vec2 p) {
        return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec2 grain = vec2(random(uv + time * 0.1));
        outputColor = vec4(inputColor.rgb * (0.85 + 0.15 * grain.x), inputColor.a);
      }
    `,
      {
        blendFunction,
        uniforms: new Map([["time", new Uniform(0)]]),
      }
    );
  }

  update(renderer: WebGLRenderer, inputBuffer: any, deltaTime: number) {
    this.uniforms.get("time")!.value += deltaTime;
  }
}

extend({ GrainEffect });

export const Effects = forwardRef(() => {
  return (
    <EffectComposer>
      <Noise opacity={0.15} />
      {/* <grainEffect blendFunction={BlendFunction.MULTIPLY} /> */}
    </EffectComposer>
  );
});

Effects.displayName = "Effects";