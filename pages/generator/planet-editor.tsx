import Link from 'next/link';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import SubPage from '../../generator/components/SubPage';
import Controls from '../../generator/components/Controls';
import { usePlanetEditorState } from '../../generator/hooks/use-planet-editor-state';
import SceneDisplay from '../../generator/components/SceneDisplay';
import PlanetEditorSceneManager from '../../generator/services/planet-editor-scene';

const sceneManager = new PlanetEditorSceneManager(); // Then add a section to mint the image as an NFT

export default function PlanetEditor () {
	const planetState = usePlanetEditorState(sceneManager.planet);

	return (
		<SubPage header='Planet Editor'>
			<Row style={{ height: '' }}>
				<Col lg={6} xs={12} className="display">
					<SceneDisplay sceneManager={sceneManager} />
				</Col>
				<Col lg={6} xs={12} className="controls">
					<Controls {...{ planetState }}  />
				</Col>
			</Row>
		</SubPage>);
}