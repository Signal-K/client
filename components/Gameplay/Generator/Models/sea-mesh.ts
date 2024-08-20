import { MeshPhongMaterial, Geometry, Color, Vector3, VertexColors} from 'three';
import { QuadSphereMesh } from './quad-sphere-mesh';
import { PlanetMesh } from './planet-mesh';

export class SeaMesh extends QuadSphereMesh {
    private _radius: number = 1;
    public get radius () { return this._radius }
    public set radius ( value: number ) { this._radius = Math.max(0, value); }
    public get opacity () { return ( this.material as MeshPhongMaterial ).opacity; }
    public set opacity ( value: number ) { ( this.material as MeshPhongMaterial ).opacity = value; }
    
    public color: string = '#002050';
    public seed: string;
    
    private _planet: PlanetMesh;
    public constructor (planet: PlanetMesh) {
        super ( 32, new MeshPhongMaterial ({
            transparent: true,
            color: '#000810',
            opacity: 0.85,
            specular: '#004488',
            emissive: '#001030',
            flatShading: true,
        }));

        this._planet = planet;
    }

    public regenerateTerrain() {
        const geometry = this.geometry as Geometry;
        geometry.vertices = geometry.vertices.map( vertex => vertex.normalize().multiplyScalar(( this._planet.radius + this._radius - 1 )));
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.verticesNeedUpdate = true;
        geometry.normalsNeedUpdate = true;
        geometry.elementsNeedUpdate = true;
        this.regenerateWireFrames();
    }

    public regenerateShading() {
        const faceMaterial = this.material as MeshPhongMaterial;
        faceMaterial.vertexColors = VertexColors; // facematerial.color = new Color('#ffffff'); // new Color(this.settings.color);
        const center = new Vector3(0, 0, 0);
        const geometry = this.geometry as Geometry; // geometry.faces.forEach(face => { face.vertexColors = [face.a, face.b, face.c].map(i => new Color('#000080')); })
    }

    public update(dT: number) {
        /* if (!!this.rotate) {
            this.rotateY(dT*this.rotate);
        } */
    }
}