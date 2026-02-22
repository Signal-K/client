interface GroupableClassification {
  classificationtype: string | null;
  classificationConfiguration?: {
    annotationOptions?: string[];
    [key: string]: any;
  };
}

export function useGroupedClassifications<T extends GroupableClassification>(classifications: T[]) {
  const grouped: Record<string, T[]> = {};

  classifications.forEach((classification) => {
    const classificationType = classification.classificationtype || "unknown";
    if (!grouped[classificationType]) {
      grouped[classificationType] = [];
    }
    grouped[classificationType].push(classification);
  });

  return Object.entries(grouped).map(([type, entries]) => ({
    type,
    entries: entries.map((entry) => ({
      ...entry,
      annotationOptions: Array.isArray(entry.classificationConfiguration?.annotationOptions)
        ? entry.classificationConfiguration.annotationOptions
        : [],
    })),
  }));
}
