import { useState } from 'react';
import Image from 'next/image'
import { ChevronDown, ChevronUp, MessageSquare, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Animal, Comment } from '../types/greenhouse'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnimalFollowUpProps {
  animal: Animal;
  comments: Comment[];
  onAddComment: (animalId: string, comment: string) => void;
  onUpdateClassification: (animalId: string, classification: string) => void;
}

export function AnimalFollowUp({ animal, comments, onAddComment, onUpdateClassification }: AnimalFollowUpProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [newClassification, setNewClassification] = useState(animal.classification)

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    onAddComment(animal.id, newComment)
    setNewComment('')
  };

  const handleUpdateClassification = () => {
    onUpdateClassification(animal.id, newClassification)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div 
        className="p-4 bg-[#2C4F64] text-white cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-semibold">{animal.name}</h3>
          <p className="text-sm opacity-80">ID: {animal.id} | Project: {animal.projectName}</p>
        </div>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isExpanded && (
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={animal.image}
                  alt={animal.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-4 space-y-2">
                <p><strong>Species:</strong> {animal.species}</p>
                <p><strong>Last Observed:</strong> {animal.lastObserved}</p>
                <p><strong>Status:</strong> {animal.status}</p>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="comments">
                <TabsList>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="classification">Classification</TabsTrigger>
                </TabsList>
                <TabsContent value="comments">
                  <div className="space-y-4">
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-sm text-[#2C4F64]">{comment.text}</p>
                          <p className="text-xs text-[#2C4F64]/70 mt-1">{comment.user} - {comment.timestamp}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSubmitComment} className="flex gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-grow"
                      />
                      <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send comment</span>
                      </Button>
                    </form>
                  </div>
                </TabsContent>
                <TabsContent value="classification">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="classification">Current Classification</Label>
                      <Input 
                        id="classification"
                        value={newClassification}
                        onChange={(e) => setNewClassification(e.target.value)}
                        placeholder="Enter animal classification"
                      />
                    </div>
                    <Button onClick={handleUpdateClassification} className="w-full bg-[#85DDA2] text-white hover:bg-[#85DDA2]/90">
                      Update Classification
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};