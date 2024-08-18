import { useEffect, useState } from 'react';
import AnimalClassification from '@/app/(create)/(classifications)/ZoodexClassification';
import { MetaOptions } from '@/app/api/citizen/zoodex/types';

interface ClassificationOption {
    id: number;
    text: string;
    thumbnail: string;
};

const metaOptions: MetaOptions[] = [
    {
        id: 1,
        text: "Prey deliveries",
    },
    {
        id: 2,
        text: 'Adult owls'
    },
    {
        id: 3,
        text: 'Young'
    },
    {
        id: 4,
        text: 'Mating/Feeding event'
    },
];

const options: ClassificationOption[] = [
    {
        id: 1, 
        text: "Burrowing owl",
        thumbnail: 'https://panoptes-uploads.zooniverse.org/project_avatar/5dd03c83-53ea-4162-a1b5-2802939d10d3.jpeg'
    },
    {
        id: 2, 
        text: 'Rabbit',
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_thumbnail/3eb19764-6543-4e5a-b667-bd5cf9623ddf.jpeg'
    },
    {
        id: 3, 
        text: "Bobcat",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_thumbnail/e07ff74b-dae9-48bd-ba50-d301424af14f.jpeg'
    },
    {
        id: 4, 
        text: "Raptor",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_thumbnail/3f27cef0-fc7b-40ce-9e1c-c0e369112cce.jpeg'
    },
    {
        id: 5, 
        text: "Coyote",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_thumbnail/ad94f66b-af30-4c56-ae84-1e82026bcdb5.jpeg'
    },
    {
        id: 6, 
        text: "Raven/Crow",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_thumbnail/7a162e71-7465-46d8-8025-284253ec0ee0.jpeg'
    },
    {
        id: 7, 
        text: "Cow",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/workflow_attached_thumbnail/584efd38-d401-45d5-8a0f-e330cea8eb04.jpeg'
    },
    {
        id: 8, 
        text: "Rodent",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_thumbnail/cc4d182e-dc2c-46b0-841a-f1a060dace62.jpeg'
    },
    {
        id: 9, 
        text: "Domestic/feral cat",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_thumbnail/57379a90-0a5c-453c-9e8a-6d69cfd17668.jpeg'
    },
    {
        id: 10, 
        text: "Skunk",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/b6441e54-922a-4d9a-a4c4-89d2d6b1cfb9.jpeg'
    },
    {
        id: 11, 
        text: "Domestic/feral dog",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/83481077-920c-430f-ad96-447c4b773deb.jpeg'
    },
    {
        id: 12, 
        text: "Snake",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/409386e7-16f9-459c-ad14-0de8d592fdbc.jpeg'
    },
    {
        id: 13, 
        text: "Mouse",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/4ea3f19a-824e-4878-8db3-e8789fb147bd.jpeg'
    },
    {
        id: 14, 
        text: "Squirrel",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/eae37621-d647-4172-8fc0-2068143c72af.jpeg'
    },
    {
        id: 15, 
        text: "Opossum",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/707d98a3-7520-4272-8532-e12f36deb2e6.jpeg'
    },
    {
        id: 16, 
        text: "Weasel",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/9d5cdade-df18-43fe-a497-f968c2b0abc5.jpeg'
    },
    {
        id: 17, 
        text: "Raccoon",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/1c38b2fe-252f-4770-ac79-9e8a23df8426.jpeg'
    },
    {
        id: 18, 
        text: "Human",
        thumbnail: 'https://thumbnails.zooniverse.org/500x/panoptes-uploads.zooniverse.org/production/workflow_attached_image/9e02a6d0-6e36-4343-b4c3-570840826244.jpeg'
    },
];

const Zoodex = () => {
    const [options, setOptions] = useState<ClassificationOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await fetch('/api/citizen/zoodex/burrowingOwl');
                const data = await res.json();
                setOptions(data.options); // Extract options from the response
            } catch (error) {
                console.error('Error fetching classification options:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchOptions();
    }, []);    

    const handleClassificationSubmit = (selectedOption: ClassificationOption | null, comment: string) => {
        // Handle the classification submission here, e.g., save to database or send to API
        console.log('Selected Option:', selectedOption);
        console.log('Comment:', comment);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AnimalClassification
            imageUrl="https://example.com/path-to-image.jpg"
            options={options}
            onSubmit={handleClassificationSubmit}
        />
    );
};

export default Zoodex;