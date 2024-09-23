export interface Mission {
    id: number;
    name: string;
    description?: string;
    rewards?: number[];
    anomaly?: number;
};