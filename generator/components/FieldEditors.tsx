import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Octicon, { Sync } from '@primer/octicons-react';
import InputGroup from 'react-bootstrap/InputGroup';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';
import { Vector2, Vector3 } from 'three';


import { randomSeed } from '../services/helpers';
import { SliderPicker as ColorSlider } from 'react-color';

const sliderStyle = {
	height: '24px'
};

export function TextBox(props: { label: string, value: string, onChange: (value: string) => void }) {
	return (
		<Form.Group as={Col}>
			<Form.Label><strong>{props.label}:</strong> {props.value + ''}</Form.Label>
			<Form.Control type="text" value={props.value + ''} onChange={handleChange} />
		</Form.Group>
	);

	function handleChange(e: any) {
		props.onChange && props.onChange(e.target.value);
	}
}

export function SeedInput(props: { label?: string, value: string, onChange: (value: string) => void }) {
	return (
		<Form.Group as={Col}>
			<Form.Label><strong>{props.label || 'Seed'}:</strong></Form.Label>
				<InputGroup>
						<Form.Control type="input" value={props.value + ''} onChange={handleChange} />
						<InputGroup.Append>
								<Button variant="outline-secondary" title='Randomize' onClick={handleRandomization}>
										<Octicon icon={Sync} />
								</Button>
						</InputGroup.Append>
				</InputGroup>
		</Form.Group>
	);

	function handleRandomization() {
		props.onChange && props.onChange(randomSeed());
	}

	function handleChange(e: any) {
		props.onChange && props.onChange(e.target.value);
	}
}

export function ColorPicker(props: { label: string, value: string, onChange: (value: string) => void }) {
	
	return (
		<Form.Group as={Col}>
			<Form.Label>{props.label}: {props.value}</Form.Label>
			<ColorSlider color={props.value} onChangeComplete={handleChange} />
		</Form.Group>
	);

	function handleChange(e: any) {
		props.onChange && props.onChange(e.hex.toUpperCase());
	}
}

export function NumberSlider(props: { label: string, min: number, max: number, step: number, value: number, onChange: (value: number) => void }) {
	return (
		<Form.Group as={Col}>
			<Form.Label><strong>{props.label}:</strong> {props.value}</Form.Label>
			<Slider min={props.min} max={props.max} defaultValue={props.value} step={props.step} onChange={props.onChange} />
		</Form.Group>
	);
}

const VECTOR_LABEL_WIDTH = 3;
export function Vector2Slider({ label, min, max, step, value, onChange }: { label: string, min: Vector2 | number, max: Vector2 | number, step?: Vector2 | number, value: Vector2, onChange: (value: Vector2) => void }) {
	step = typeof step === 'undefined' ? 1 : step;

	let vectorMin = typeof min === 'number' ? new Vector2(min, min) : min;
	let vectorMax = typeof max === 'number' ? new Vector2(max, max) : max;
	let vectorStep = typeof step === 'number' ? new Vector2(step, step) : step;

	return (<Form.Group as={Col}>
		<Form.Label className='font-weight-bold mb-0'>{label}:</Form.Label>
		<Row>
			<Col xs={VECTOR_LABEL_WIDTH}><strong>X:</strong> {value.x}</Col>
			<Col className='pl-0'>
				<Slider min={vectorMin.x} max={vectorMax.x} defaultValue={value.x} step={vectorStep.x} onChange={handleChange('x')} />
			</Col>
		</Row>
		<Row>
			<Col xs={VECTOR_LABEL_WIDTH}><strong>Y:</strong> {value.y}</Col>
			<Col className='pl-0'>
				<Slider min={vectorMin.y} max={vectorMax.y} defaultValue={value.y} step={vectorStep.y} onChange={handleChange('y')} />
			</Col>
		</Row>
	</Form.Group>);

	function handleChange(part: 'x' | 'y') {
		return (newValue: number) => {
			if (onChange) {
				if (part === 'x') {
					onChange(new Vector2(newValue, value.y));
				} else {
					onChange(new Vector2(value.x, newValue));
				}
			}
		}
	}
}

export function Vector3Slider({ label, min, max, step, value, onChange }: { label: string, min: Vector3 | number, max: Vector3 | number, step?: Vector3 | number, value: Vector3, onChange: (value: Vector3) => void }) {
	step = typeof step === 'undefined' ? 1 : step;

	let vectorMin = typeof min === 'number' ? new Vector3(min, min, min) : min;
	let vectorMax = typeof max === 'number' ? new Vector3(max, max, max) : max;
	let vectorStep = typeof step === 'number' ? new Vector3(step, step, step) : step;

	return (<Form.Group as={Col}>
		<Form.Label className='font-weight-bold mb-0'>{label}:</Form.Label>
		<Row>
			<Col xs={VECTOR_LABEL_WIDTH}><strong>X:</strong> {value.x}</Col>
			<Col className='pl-0'>
				<Slider min={vectorMin.x} max={vectorMax.x} defaultValue={value.x} step={vectorStep.x} onChange={handleChange('x')} />
			</Col>
		</Row>
		<Row>
			<Col xs={VECTOR_LABEL_WIDTH}><strong>Y:</strong> {value.y}</Col>
			<Col className='pl-0'>
				<Slider min={vectorMin.y} max={vectorMax.y} defaultValue={value.y} step={vectorStep.y} onChange={handleChange('y')} />
			</Col>
		</Row>
		<Row>
			<Col xs={VECTOR_LABEL_WIDTH}><strong>Z:</strong> {value.z}</Col>
			<Col className='pl-0'>
				<Slider min={vectorMin.z} max={vectorMax.z} defaultValue={value.z} step={vectorStep.z} onChange={handleChange('z')} />
			</Col>
		</Row>
	</Form.Group>);

	function handleChange(part: 'x' | 'y' | 'z') {
		return (newValue: number) => {
			if (onChange) {
				switch (part) {
					case 'x':
						onChange(new Vector3(newValue, value.y, value.z));
						break;
					case 'y':
						onChange(new Vector3(value.x, newValue, value.z));
						break;
					case 'z':
						onChange(new Vector3(value.x, value.y, newValue));
						break;
				}
			}
		}
	}
}

export function CheckboxInput(props: { label: string, value: boolean, onChange: (value: boolean) => void }) {
	
	return (
		<Form.Group as={Col}>
			<Form.Check type='checkbox' label={props.label} checked={props.value} onChange={handleChange} />
		</Form.Group>
	);

	function handleChange(e: any) {
		props.onChange && props.onChange(e.target.checked);
	}
}