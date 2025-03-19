import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Define starter traits
const starterTraits = [
  "flying", "wings", "feathered", "social", "intelligent",
  "amphibious", "poisonous", "fast", "slow", "scaled",
  "hairy", "bald", "nocturnal"
];

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    // Get file from the form data
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      console.error("No file found in request.");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    console.log("File received. Size:", buffer.length, "bytes");

    // Call OpenAI API
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional biologist AI. Classify the organism in the image with as much detail as possible, including its kingdom, species, bio, traits, and compatible biomes. Ensure the response is formatted as pure JSON without markdown or code block syntax."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What organism is in this image? Provide a detailed classification in pure JSON format." },
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

    // Extract the content from OpenAI response
    let classification = openaiRes.data.choices[0].message.content;

    // Strip any markdown formatting if present
    classification = classification.replace(/```json|```/g, "").trim();

    // Parse classification response safely
    let parsedClassification;
    try {
      parsedClassification = JSON.parse(classification);
    } catch (parseError) {
      console.error("Failed to parse classification:", parseError);
      return NextResponse.json({ error: "Invalid classification data" }, { status: 500 });
    }

    console.log("Parsed Classification:", parsedClassification);

    // Ensure traits is an array or convert it from string
    const detectedTraits = Array.isArray(parsedClassification.traits)
      ? parsedClassification.traits
      : typeof parsedClassification.traits === "string"
      ? parsedClassification.traits.split(",").map((t: string) => t.trim())
      : [];

    console.log("Detected Traits:", detectedTraits);

    // Extract relevant traits from starterTraits
    const relevantTraits = starterTraits
      .filter((trait) => detectedTraits.includes(trait))
      .slice(0, 3);

    // Ensure we always return 3 traits minimum
    while (relevantTraits.length < 3) {
      const remainingTraits = starterTraits.filter(
        (trait) => !relevantTraits.includes(trait)
      );
      if (remainingTraits.length === 0) break; // Avoid infinite loop
      relevantTraits.push(
        remainingTraits[Math.floor(Math.random() * remainingTraits.length)]
      );
    }

    // Assign relevant traits to the final classification
    parsedClassification.traits = relevantTraits;

    // Return the final JSON classification
    return NextResponse.json(parsedClassification);
  } catch (error: any) {
    console.error("Error in API route:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to classify image" }, { status: 500 });
  }
};