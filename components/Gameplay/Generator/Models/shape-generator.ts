
import { Vector3, Quaternion } from 'three';
import Alea from 'alea';
import SimplexNoise from 'simplex-noise'; // We had import errors with the latest Simplex version (^4.0.1), so we've gone backwards for now

import { PlanetLayer, NoiseSettings, MaskTypes } from './planet-settings';

export class ShapeGenerator {
    private _noiseFilters: NoiseFilter[];
    private _layers: PlanetLayer[];
    private _radius: number;

    public constructor(layers: PlanetLayer[], radius: number, seed: string) {
        this._layers = layers;
        this._radius = radius;

        const prng = Alea(seed || '');
        this._noiseFilters = [];
        for (let i = 0; i < this._layers.length; i++) {
            this._noiseFilters[i] = new NoiseFilter(new SimplexNoise(prng), this._layers[i].noiseSettings);
        }
    }

    public CalculatePointOnPlanet(pointOnSphere: Vector3): Vector3 {
        let firstLayerValue = 0;
        let prevLayerValue = 0;
        let elevation = -1;
        
        pointOnSphere.normalize();
        const pointOnUnitSphere: Vector3 = pointOnSphere.clone();

        if (this._noiseFilters.length > 0) {
            firstLayerValue = prevLayerValue = this._noiseFilters[0].Evaluate(pointOnUnitSphere);
            if (this._layers[0].enabled) {
                elevation = firstLayerValue;
            }
        }

        for (let i = 1; i < this._noiseFilters.length; i++) {
            if (this._layers[i].enabled) {
                const mask = (this._layers[i].maskType === MaskTypes.FirstLayer && firstLayerValue > this._layers[0].noiseSettings.minValue) ? 1 :
                    (this._layers[i].maskType === MaskTypes.PrevLayer && prevLayerValue > this._layers[i-1].noiseSettings.minValue) ? 1 : 
                    (this._layers[i].maskType === MaskTypes.None) ? 1 : 0;

                prevLayerValue = this._noiseFilters[i].Evaluate(pointOnUnitSphere);
                elevation = Math.max(elevation, prevLayerValue * mask);
            }
        }

        return pointOnSphere.multiplyScalar(this._radius + elevation);
    }
}

export class NoiseFilter {
    
    public constructor(private noise: SimplexNoise, private settings: NoiseSettings) { }

    public Evaluate(point: Vector3): number {
        let noiseValue = 0;
        let frequency = this.settings.baseRoughness;
        let amplitude = 1;
        let ampTotal = amplitude;

        let q = new Quaternion().setFromAxisAngle(this.settings.skew, Math.PI / 2);
        for (let i = 0; i < this.settings.octaves; i++) {
            let p = point.clone().multiplyScalar(frequency).add(this.settings.offset);
            p = p.applyQuaternion(q);
            let v = (this.noise.noise3D(p.x/this.settings.stretch.x, p.y/this.settings.stretch.y, p.z/this.settings.stretch.x));
            noiseValue += v * amplitude;
            frequency *= this.settings.roughness;
            amplitude *= this.settings.persistence;
            ampTotal += amplitude;
        }

        noiseValue = noiseValue / ampTotal;
        noiseValue = Math.max(noiseValue, this.settings.minValue);
        return noiseValue * this.settings.strength;
    }
}