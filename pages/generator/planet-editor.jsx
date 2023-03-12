import Link from "next/link";
import React, { createRef, useState } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import SubPage from "../../components/Gameplay/Generator/Subpage";

import Controls from "../../components/Gameplay/Generator/Controls";
import { usePlanetEditorState } from "../../components/Gameplay/Generator/Hooks/use-planet-editor-state";
import SceneDisplay from "../../components/Gameplay/Generator/Panels/SceneDisplay";
import PlanetEditorSceneManager from "../../components/Gameplay/Generator/Services/planet-editor-scene";

import { useScreenshot } from 'use-react-screenshot';

const sceneManager = new PlanetEditorSceneManager(); // Then add a section to mint the image as an NFT

export default function PlanetEditor () {
	const planetState = usePlanetEditorState(sceneManager.planet);
	
	const ref = createRef(null); // Should be createRef(null) -> if experiencing problems, fix this line and change file to be `planet-editor.jsx` rather than `..tsx`
	const [width, setWidth] = useState(300);
	const [image, takeScreenShot] = useScreenshot();
	const getImage = () => takeScreenShot();

	return (
		<SubPage header='Planet Editor'>
			<br />
			<Row style={{ height: '' }}>
				<Col lg={6} xs={12} className="display">
					<SceneDisplay sceneManager={sceneManager} />
				</Col>
				<Col lg={6} xs={12} className="controls">
					<Controls {...{ planetState }}  />
				</Col>
			</Row>
		</SubPage>
	);
}

export function PlanetEditorFromData () {
	const planetState = usePlanetEditorState(sceneManager.planet);
	
	const ref = createRef(null); // Should be createRef(null) -> if experiencing problems, fix this line and change file to be `planet-editor.jsx` rather than `..tsx`
	const [width, setWidth] = useState(300);
	const [image, takeScreenShot] = useScreenshot();
	const getImage = () => takeScreenShot();

	return (
		<SubPage header='Planet Editor'>
			<br />
			<Row style={{ height: '' }}>
				<Col lg={6} xs={12} className="display">
					<SceneDisplay sceneManager={sceneManager} />
				</Col>
				{/*<Col lg={6} xs={12} className="controls">
					<Controls {...{ planetState }}  />
				</Col>*/}
			</Row>
		</SubPage>
	);
}