import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

interface UploadCardProps {
  uploadId: number;
  author: string | null;
  media: any | null;
  structureType: string | null;
  createdAt: string;
}

export function UploadCard({
  uploadId,
  author,
  media,
  structureType,
  createdAt,
}: UploadCardProps) {
  const images: string[] = media?.uploadUrl ? [media.uploadUrl] : [];

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-primary">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${author}`} />
            <AvatarFallback>{author?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Upload by {author}</CardTitle>
            <p className="text-sm text-muted-foreground">Uploaded on: {new Date(createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <img key={index} src={image} alt={`Upload ${uploadId}`} className="w-full h-auto max-w-xs object-cover" />
            ))}
          </div>
        )}
        {structureType && (
          <div className="mt-4 p-4 border border-secondary rounded">
            <h3 className="text-lg font-bold">Structure Type</h3>
            <p>{structureType}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};