import { JupyterNotebookViewer } from 'react-jupyter-notebook-viewer';

export default function Notebook ( props ) {
    const notebook = new JupyterNotebookViewer ( props );
    return ( 
        <>
            { notebook }
        </>
    );
}