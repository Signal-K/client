export interface Comment {
    id: number;
    content: string;
    author: string;
    replies?: Comment[];
}