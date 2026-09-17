export interface Anomaly {
    id: bigint;
    content?: string | null;
    anomalytype?: string | null;
    anomalySet?: string | null;
    type?: string | null;
    classification_status?: string | null;
    avatar_url?: string | null;
    created_at?: string; 
    deepnote?: string | null;
    configuration?: Record<string, any> | null; 
    parentAnomaly?: bigint | null;
};

export interface Classification {
    id: bigint;
    created_at: string;
    content: string | null;
    author: string | null; 
    anomaly: bigint | null;
    media: any | null; 
    classificationtype: string | null;
    classificationConfiguration: Record<string, any> | null;
};