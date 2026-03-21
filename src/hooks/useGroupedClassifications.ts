interface GroupableClassification {
  classificationtype: string | null;
  classificationConfiguration?: {
    annotationOptions?: string[];
    [key: string]: any;
  };
}

export function groupClassifications<T extends GroupableClassification>(classifications: T[]) {
  const grouped: Record<string, T[]> = {};

  for (const classification of classifications) {
    const type = classification.classificationtype || "unknown";
    (grouped[type] ??= []).push(classification);
  }

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


