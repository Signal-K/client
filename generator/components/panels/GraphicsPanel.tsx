import { CheckboxInput, NumberSlider } from "../FieldEditors";
import { PlanetEditorState } from "../../hooks/use-planet-editor-state";

export default function GraphicsPanel({ planetState }: { planetState: PlanetEditorState }) {
    return (
        <>
            <NumberSlider label='Resolution' min={2} max={128} step={1} value={planetState.resolution.current} onChange={planetState.resolution.set} />
            <NumberSlider label='Rotate' min={0} max={2} step={0.01} value={planetState.rotate.current} onChange={planetState.rotate.set} />
            <CheckboxInput label='Wireframes' value={planetState.wireframes.current} onChange={planetState.wireframes.set} />
        </>
    );
}