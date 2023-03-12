import { Mesh, LineSegments, Material, Geometry, WireframeGeometry, LineBasicMaterial, Color, Vector3, Face3, Vector2 } from 'three';
import { directionsList, Direction } from './direction';

export class QuadSphereMesh extends Mesh {
    private _resolution: number;
    public get resolution(): number { return this._resolution; }
    public set resolution( value: number ) { this._resolution = Math.max(Math.min(value, 256), 2); }
    private _wireframes: LineSegments;
    public get wireframes() { return this._wireframes.visible; }
    public set wireframes( value: boolean ) { this._wireframes.visible = value; }
    public constructor (resolution: number = 32, material?: Material ) {
        super(new Geometry(), material);
        this.resolution = resolution;
        this._wireframes = new LineSegments();
        this._wireframes.visible = false;
        this.add(this._wireframes);
    };

    public regenerateMesh () {
        let geometry = new Geometry();
        directionsList.forEach(direction => { geometry.merge(this._generateFaceGeometry(direction)); });
        
        // Merge vertices into a single geometry
        geometry.mergeVertices();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        this.geometry.dispose();
        this.geometry = geometry;
    }

    protected regenerateWireFrames () {
        this._wireframes.geometry.dispose(); // Build the wireframes
        this._wireframes.geometry = new WireframeGeometry(this.geometry);
        const wireframeMat = (this._wireframes.material as LineBasicMaterial);
        wireframeMat.color = new Color(0x000000);
        wireframeMat.linewidth = 2;
        wireframeMat.opacity = 0.25;
        wireframeMat.transparent = true;
    }

    private _generateFaceGeometry(localUp: Direction) {
        const axisA = new Vector3(localUp.vector.y, localUp.vector.z, localUp.vector.x);
        const axisB = localUp.vector.clone().cross(axisA);
        const geometry = new Geometry();
        const vertices: Vector3[] = [];
        const triangles: Face3[] = [];

        for (let y = 0; y < this.resolution; y++) {
            for (let x = 0; x < this.resolution; x++) {
                const i = x + y * this.resolution;
                const percent = new Vector2(x, y).divideScalar(this.resolution - 1);
                const pointOnUnitCube = localUp.vector.clone()
                    .add(axisA.clone().multiplyScalar((percent.x - 0.5) * 2))
                    .add(axisB.clone().multiplyScalar((percent.y - 0.5) * 2));
                    vertices[i] = pointOnUnitCube.clone().normalize();

                if (x != this.resolution - 1 && y != this.resolution - 1) {
                    triangles.push(
                        new Face3(i, i + this.resolution + 1, i + this.resolution),
                        new Face3(i, i + 1, i + this.resolution + 1)
                    );
                }
            }
        }

        geometry.vertices = vertices;
        geometry.faces = triangles;
        return geometry;
    }
}