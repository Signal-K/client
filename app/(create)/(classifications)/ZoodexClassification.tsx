import React, { useState } from 'react';
import Image from 'next/image';

interface ClassificationOption {
    id: number;
    text: string;
    thumbnail: string;
}

interface AnimalClassificationProps {
    imageUrl: string;
    options: ClassificationOption[];
    onSubmit: (selectedOption: ClassificationOption | null, comment: string) => void;
}

const AnimalClassification: React.FC<AnimalClassificationProps> = ({ imageUrl, options, onSubmit }) => {
    const [selectedOption, setSelectedOption] = useState<ClassificationOption | null>(null);
    const [comment, setComment] = useState<string>('');

    const handleSubmit = () => {
        onSubmit(selectedOption, comment);
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            {/* Display the image */}
            <div className="mb-4">
                <Image
                    src={imageUrl}
                    alt="Animal to classify"
                    width={1024}
                    height={768}
                    className="object-cover rounded-lg"
                />
            </div>

            {/* Display classification options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {options.map(option => (
                    <div
                        key={option.id}
                        className={`p-2 border rounded-lg cursor-pointer transition-transform transform hover:scale-105 ${
                            selectedOption?.id === option.id ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        onClick={() => setSelectedOption(option)}
                    >
                        <Image
                            src={option.thumbnail}
                            alt={option.text}
                            width={100}
                            height={100}
                            className="object-cover rounded-lg"
                        />
                        <p className="text-center mt-2">{option.text}</p>
                    </div>
                ))}
            </div>

            {/* Comment input */}
            <textarea
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                placeholder="Add any additional comments..."
                value={comment}
                onChange={e => setComment(e.target.value)}
            />

            {/* Submit button */}
            <button
                onClick={handleSubmit}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                Submit Classification
            </button>
        </div>
    );
};

export default AnimalClassification;