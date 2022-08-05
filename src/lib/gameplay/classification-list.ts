type ClassificationRow = {
  id: number;
  classificationConfiguration?: { votes?: number } | null;
  media?: unknown;
  [key: string]: unknown;
};

type SupabaseLike = {
  from: (table: string) => any;
};

export async function fetchClassificationsForVoting({
  supabase,
  classificationType,
  getImages,
}: {
  supabase: SupabaseLike;
  classificationType: string;
  getImages: (media: unknown) => string[];
}): Promise<Array<ClassificationRow & { images: string[]; votes: number }>> {
  const { data, error } = (await supabase
    .from("classifications")
    .select("*")
    .eq("classificationtype", classificationType)
    .order("created_at", { ascending: false })) as {
    data: ClassificationRow[];
    error: any;
  };

  if (error) {
    throw error;
  }

  return (data || []).map((classification) => ({
    ...classification,
    images: getImages(classification.media),
    votes: classification.classificationConfiguration?.votes || 0,
  }));
}
