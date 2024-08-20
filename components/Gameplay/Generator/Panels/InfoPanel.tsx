import { PlanetEditorState } from "../Hooks/use-planet-editor-state";
import { NumberSlider, TextBox, SeedInput, ColorPicker } from "../FieldEditors";
import Form from 'react-bootstrap/Form';
import Col from "react-bootstrap/Col";

export default function InfoPanel({ planetState }: { planetState: PlanetEditorState }) {
    return (
        <>
            <Form.Row>
                <Form.Group as={Col}>
                    <TextBox label='Name' value={planetState.name.current} onChange={planetState.name.set} />
                </Form.Group>
                <Form.Group as={Col}>
                    <SeedInput label='Seed' value={planetState.seed.current} onChange={planetState.seed.set} />
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col}>
                    <NumberSlider label='Radius' min={0.25} max={16} step={0.05} value={planetState.radius.current} onChange={planetState.radius.set} />
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col}>
                    <NumberSlider label='Sea Level' min={0} max={2} step={0.05} value={planetState.seaLevel.current} onChange={planetState.seaLevel.set} />
                </Form.Group>
            </Form.Row>
            
            
            
            {/* <ColorPicker label='Color' value={planetState.colors.current} onChange={planetState.colors.set} /> */}
        </>
    );
}