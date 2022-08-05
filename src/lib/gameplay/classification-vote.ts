import { updateClassificationConfiguration } from "@/src/lib/gameplay/classification-configuration";

export async function incrementClassificationVote(
  classificationId: number,
  fallbackVotes: number
): Promise<number | null> {
  const result = await updateClassificationConfiguration({
    classificationId,
    action: "increment_vote",
  });

  if (!result.ok) {
    console.error("Error updating classificationConfiguration:", result.error);
    return null;
  }

  const nextVotes = Number(result.classificationConfiguration?.votes);
  return Number.isFinite(nextVotes) ? nextVotes : fallbackVotes + 1;
}
