import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const starterTraits = [
  "flying", "wings", "feathered", "social", "intelligent",
  "amphibious", "poisonous", "fast", "slow", "scaled",
  "hairy", "bald", "nocturnal"
];

const anomalousTraits = [
  "amorphous", "translucent", "bioluminescent", "deep-sea", "no eyes",
  "multiple limbs", "gelatinous", "blob-like", "tentacled", "spiked",
  "unusual appendages", "rare", "unknown species", "unclassified"
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      console.error("No file found in request.");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    console.log("File received. Size:", buffer.length, "bytes");

    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `
              You are a professional biologist AI. Classify the organism in the image with as much detail as possible, including its kingdom, species, bio, traits, and compatible biomes.
              Additionally, determine how "anomalous" (unusual, unknown, alien-like) this subject is.
              The anomalous score should be between 0 (completely normal) and 10 (extremely unusual, potentially alien).
              Organisms with features like amorphous bodies, translucent skin, deep-sea adaptations, or unclassifiable traits should have a high anomalous score.
              The response must be formatted as pure JSON without markdown or code block syntax.
            `
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What organism is in this image? Provide a detailed classification in pure JSON format, including an anomalous score." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Raw OpenAI response:", openaiRes.data);

    let classification = openaiRes.data.choices[0].message.content;
    classification = classification.replace(/```json|```/g, "").trim();

    let parsedClassification;
    try {
      parsedClassification = JSON.parse(classification);
    } catch (parseError) {
      console.error("Failed to parse classification:", parseError);
      return NextResponse.json({ error: "Invalid classification data" }, { status: 500 });
    }

    console.log("Parsed Classification:", parsedClassification);

    const detectedTraits = Array.isArray(parsedClassification.traits)
      ? parsedClassification.traits
      : typeof parsedClassification.traits === "string"
      ? parsedClassification.traits.split(",").map((t: string) => t.trim())
      : [];

    console.log("Detected Traits:", detectedTraits);

    const relevantTraits = starterTraits
      .filter((trait) => detectedTraits.includes(trait))
      .slice(0, 3);

    while (relevantTraits.length < 3) {
      const remainingTraits = starterTraits.filter(
        (trait) => !relevantTraits.includes(trait)
      );
      if (remainingTraits.length === 0) break;
      relevantTraits.push(
        remainingTraits[Math.floor(Math.random() * remainingTraits.length)]
      );
    }

    parsedClassification.traits = relevantTraits;

    let anomalousScore = 0;
    for (const trait of detectedTraits) {
      if (anomalousTraits.includes(trait)) {
        anomalousScore += 2;
      }
    }
    anomalousScore = Math.min(10, anomalousScore);

    parsedClassification.anomalous_score = anomalousScore;

    return NextResponse.json(parsedClassification);
  } catch (error: any) {
    console.error("Error in API route:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to classify image" }, { status: 500 });
  }
};