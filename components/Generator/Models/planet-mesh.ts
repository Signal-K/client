import { MeshPhongMaterial, Geometry, Color, Vector3, VertexColors, MeshLambertMaterial} from 'three';
import { ShapeGenerator } from './shape-generator';
import { QuadSphereMesh } from './quad-sphere-mesh';
import { PlanetLayer } from './planet-settings';

export class PlanetMesh extends QuadSphereMesh {
    private _radius: number;
    public get radius() { return  this._radius; }
    public set radius (value: number) { this._radius = Math.max(0, value); }
    public planetColor: string;
    private _seed: string;
    public set seed (value: string) { this._seed = value; }
    public terrainLayers: PlanetLayer[] = []; // Of interface PlanetLayer, type array
    public constructor() {
        super (32, new MeshLambertMaterial({
            color: '#f0f0f0'
        }));
    }

    public regenerateTerrain() {
        const shapeGenerator = new ShapeGenerator(this.terrainLayers, this.radius, this._seed); // Look at basic arguments for ShapeGenerator class
        const geometry = this.geometry as Geometry;
        geometry.vertices = geometry.vertices.map(vertex => shapeGenerator.CalculatePointOnPlanet(vertex));
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.verticesNeedUpdate = true;
        geometry.normalsNeedUpdate = true;
        geometry.elementsNeedUpdate = true;
        this.regenerateWireFrames();
    }

    public regenerateShading() {
        const faceMaterial = this.material as MeshPhongMaterial;
        faceMaterial.vertexColors = VertexColors;
        faceMaterial.color = new Color('#ffffff'); // new Color (this.settings.color);
        const center = new Vector3(0, 0, 0);
        const geometry = this.geometry as Geometry;
        geometry.faces.forEach(face => {
            face.vertexColors =  [face.a, face.b, face.c].map(i => {
                const dist = geometry.vertices[i].distanceTo(center) - (this.radius+this.terrainLayers[0].noiseSettings.minValue);
                if(dist > 0) {
                    // Land
                    return new Color('#008000');
                } else {

                    // Water
                    return new Color('#000080');
                }
            });
        });
    }
}