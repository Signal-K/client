import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import SubPage from '../../generator/components/SubPage';

export default function AboutPage() {
	return (
		<SubPage header='About'>
			<Row>
				<Col xs={12} lg={{offset: 4, span: 4}}>
					<ListGroup>
						<ListGroup.Item>
							Designed by Signal Kinetics
						</ListGroup.Item>
					</ListGroup>
				</Col>
		</Row>
		</SubPage>);
}