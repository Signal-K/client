import { Vector3 } from "three";

export class Direction {
    constructor (public name: string, public vector: Vector3) {  }
}

export const directions = {
    UP: new Direction('Up', new Vector3(0, 1, 0)),
    DOWN: new Direction('Down', new Vector3(0, -1, 0)),
    LEFT: new Direction('Left', new Vector3(-1, 0, 0)),
    RIGHT: new Direction('Right', new Vector3(1, 0, 0)),
    FORWARD: new Direction('Forward', new Vector3(0, 0, 1)),
    BACK: new Direction('Back', new Vector3(0, 0, -1))
}

export const directionsList = [
    directions.UP,
    directions.DOWN,
    directions.LEFT,
    directions.RIGHT,
    directions.FORWARD,
    directions.BACK,
]