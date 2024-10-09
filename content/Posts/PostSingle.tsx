"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, GitFork } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PostCardSingleProps {
    title: string;
    author: string;
    content: string;
    votes: number;
    comments: number;
    category: string;
    tags: string[];
};

export function PostCardSingle({ title, author, content, votes, comments, category, tags }: PostCardSingleProps) {
    const [voteCount, setVoteCount] = useState(votes);
    const handleVote = () => {
        setVoteCount(prevCount => prevCount + 1);
    };

    return (
        <Card className="w-full max-w-2xl mx-autp my-8 squiggly-connector">
            <CardHeader>
                <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${author}`} />
                        <AvatarFallback>{author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <p className="text-sm text-muted-foreground"> by {author} </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Badge variant="secondary" className="mr-2">{category}</Badge>
                    {tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="mr-2">{tag}</Badge>
                    ))}
                </div>
                <p>{content}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={handleVote}>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    {voteCount}
                </Button>
                <Button variant="ghost" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                    <GitFork className="mr-2 h-4 w-4" />
                    Fork
                    </Button>
                </CardFooter>
                <div className="squiggly-shape" style={{ left: '-15px', top: '50%' }}></div>
                <div className="squiggly-shape" style={{ right: '-15px', bottom: '-15px' }}></div>
        </Card>
    );
};