import { useEffect, useState } from 'react';

import { Planet } from '../models/planet';
import { randomSeed, guid } from '../services/helpers';
import { MaskTypes, createContintentNoise, PlanetLayer } from '../models/planet-settings';
import { useStatePersisted } from './use-state-persisted';
import { useStateArray, StateArray } from './use-state-array';

export type StateInstance<T> = { current: T, set(value: T): void };

function usePlanetEditorFieldState<T>(key: string, initialValue: T, map?: (value: T) => T) {
	const [current, set] = useStatePersisted<T>(`world-gen:planet-editor:${key}`, initialValue);
	const [radiusRef, setRadiusRef] = useState();

	function mappedSet(value: T) {
		if (map) value = map(value);
		set(value);
	}

	return { current, set: mappedSet };
}

export function usePlanetEditorState(planet: Planet): PlanetEditorState {

	const name = usePlanetEditorFieldState('name', '', value => {
		planet.name = value;
		return planet.name;
	});

	const seed = usePlanetEditorFieldState('seed', randomSeed(), value => {
		planet.seed = value;
		planet.regenerateTerrain();
		planet.regenerateShading();
		return planet.seed;
	});

	const radius = usePlanetEditorFieldState('radius', 2, value => {
		planet.surface.radius = value; // Set this value via a get request from Flask based on Lightkurve output, add an option to override for demo purposes
		planet.regenerateTerrain();
		planet.regenerateShading();
		return planet.surface.radius;
	});

	const seaLevel = usePlanetEditorFieldState('seaLevel', 1, value => {
		planet.sea.radius = value;
		planet.sea.regenerateTerrain();
		planet.sea.regenerateShading();
		return planet.sea.radius;
	});

	const seaColor = usePlanetEditorFieldState('seaColor', '#0D1086', value => {
		planet.sea.color = value;
		planet.sea.regenerateShading();
		return planet.sea.color;
	});

	const colors = usePlanetEditorFieldState('colors', '#2D6086', value => {
		planet.surface.regenerateShading();
		return value;
	});

	const layers = useStateArray<PlanetLayer>([{
		id: guid(),
		name: '',
		enabled: true,
		maskType: MaskTypes.None,
		noiseSettings: createContintentNoise()
	}], value => {
		planet.surface.terrainLayers = value;
		//planet.regenerateMesh();
		planet.surface.regenerateTerrain();
		planet.surface.regenerateShading();
		return planet.surface.terrainLayers;
	});

	const wireframes = usePlanetEditorFieldState('wireframes', true, value => {
		planet.surface.wireframes = value;
		return planet.surface.wireframes;
	});

	const resolution = usePlanetEditorFieldState('resolution', 64, value => {
		planet.surface.resolution = Math.max(2, value);
		planet.sea.resolution = planet.surface.resolution * 2;
		planet.regenerateMesh();
		planet.regenerateTerrain();
		planet.regenerateShading();
		return planet.surface.resolution;
	});

	const rotate = usePlanetEditorFieldState('rotate', 0.21, value => {
		planet.rotate = value;
		return planet.rotate;
	});

	useEffect(() => {
		console.log(`Setting initial planet settings...`);
		planet.name = name.current;
		planet.seed = seed.current;
		planet.surface.radius = radius.current;

		planet.sea.radius = seaLevel.current;
		planet.sea.color = seaColor.current;

		planet.surface.terrainLayers = layers.current;

		planet.rotate = rotate.current;
		planet.surface.resolution = resolution.current;
		planet.surface.wireframes = wireframes.current;

		planet.regenerateMesh();
		planet.regenerateTerrain();
		planet.regenerateShading();
	}, []);

	return {
		name,
		colors,
		radius,
		seaLevel,
		seaColor,

		seed,

		layers,

		wireframes,
		resolution,
		rotate
	};
}

export interface PlanetEditorState {
	name: StateInstance<string>;
	seed: StateInstance<string>;

	colors: StateInstance<string>;
	radius: StateInstance<number>;
	
	seaLevel: StateInstance<number>;
	seaColor: StateInstance<string>;

	layers: StateArray<PlanetLayer>,

	wireframes: StateInstance<boolean>;
	resolution: StateInstance<number>;
	rotate: StateInstance<number>;
}