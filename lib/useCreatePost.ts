import { useMutation } from "@tanstack/react-query";

type CreatePostArgs = { // Consider adding more fields as described https://www.notion.so/skinetics/Lens-posting-a07f0e9c243249c0a3517e4160874137#1aa987be357644e596b1bd6b6cba88f9
    image: File;
    title: string;
    description: string;
    content: string;
};