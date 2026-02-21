type ConfigurationAction = "merge" | "increment_vote";

type UpdateClassificationConfigurationArgs = {
  classificationId: number;
  action: ConfigurationAction;
  patch?: Record<string, unknown>;
};

export async function updateClassificationConfiguration({
  classificationId,
  action,
  patch,
}: UpdateClassificationConfigurationArgs): Promise<{
  ok: boolean;
  error?: string;
  classificationConfiguration?: Record<string, unknown>;
}> {
  try {
    const response = await fetch("/api/gameplay/classifications/configuration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classificationId,
        action,
        patch,
      }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, error: result?.error || "Failed to update classification configuration" };
    }

    return {
      ok: true,
      classificationConfiguration: result?.classificationConfiguration,
    };
  } catch (error: any) {
    return { ok: false, error: error?.message || "Failed to update classification configuration" };
  }
}

export async function mergeClassificationConfiguration(
  classificationId: number,
  patch: Record<string, unknown>
) {
  return updateClassificationConfiguration({
    classificationId,
    action: "merge",
    patch,
  });
}
