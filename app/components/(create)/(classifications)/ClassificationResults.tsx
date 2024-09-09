interface ClassificationResultProps {
    classificationConfiguration: { [key: string]: boolean } | null;
};

export const ClassificationResult: React.FC<ClassificationResultProps> = ({ classificationConfiguration }) => {
    if (!classificationConfiguration) return null; // Don't show if no classification data is available

    return (
        <div className="p-4 mt-4 w-full bg-[#4C566A] text-white rounded-md">
            <h3 className="text-lg font-bold mb-2">Classification Result</h3>
            <ul className="list-disc list-inside">
                {Object.entries(classificationConfiguration).map(([key, value]) => (
                    <li key={key}>
                        {key}: {value ? "Selected" : "Not Selected"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface ClassificationOutputProps {
    configuration: any;
}

export const ClassificationOutput: React.FC<ClassificationOutputProps> = ({ configuration }) => {
    return (
        <div className="mt-4 p-4 bg-[#4C566A] rounded-lg">
            <h3 className="text-white mb-2">Classification Configuration Output</h3>
            <pre className="text-[#D8DEE9] bg-[#2E3440] p-2 rounded-md">
                {JSON.stringify(configuration, null, 2)}
            </pre>
        </div>
    );
};