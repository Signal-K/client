import { Group } from "three";
import { PlanetMesh } from "./planet-mesh";
import { SeaMesh } from "./sea-mesh";

export class Planet extends Group {
    public surface: PlanetMesh;
    public sea: SeaMesh;
    private _seed: string;
    public get seed () { return this._seed; }
    public set seed ( value: string ) {
        this._seed = value;
        this.surface.seed = this.sea.seed = this._seed;
    }

    public rotate: number;
    constructor () {
        super();
        this.add(this.surface = new PlanetMesh());
        this.add(this.sea = new SeaMesh(this.surface));
    }

    public regenerateTerrain() {
		this.surface.regenerateTerrain();
		this.sea.regenerateTerrain();
	}

	public regenerateShading() {
		this.surface.regenerateShading();
		this.sea.regenerateShading();
	}

	public regenerateMesh() {
		this.surface.regenerateMesh();
		this.sea.regenerateMesh();
	}

	public update(dT: number) {
		if (!!this.rotate) {
			this.rotateY(dT * this.rotate);
		}
	}
}