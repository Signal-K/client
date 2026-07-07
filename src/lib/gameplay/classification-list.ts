type ClassificationRow = {
  id: number;
  classificationConfiguration?: { votes?: number } | null;
  media?: unknown;
  [key: string]: unknown;
};

export async function fetchClassificationsForVoting({
  classificationType,
  getImages,
}: {
  classificationType: string;
  getImages: (media: unknown) => string[];
}): Promise<Array<ClassificationRow & { images: string[]; votes: number }>> {
  const params = new URLSearchParams({ classificationtype: classificationType });
  const response = await fetch(`/api/gameplay/classifications?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch classifications: ${response.status}`);
  }

  const { classifications } = (await response.json()) as { classifications: ClassificationRow[] };

  return (classifications || []).map((classification) => ({
    ...classification,
    images: getImages(classification.media),
    votes: classification.classificationConfiguration?.votes || 0,
  }));
}
