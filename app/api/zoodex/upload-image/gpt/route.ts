import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
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

    // OpenAI request
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional biologist AI. Classify the organism in the image with as much detail as possible, including its kingdom, phylum, class, order, family, genus, and species if identifiable.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What organism is in this image? Provide a detailed classification." },
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

    console.log("OpenAI response:", openaiRes.data);

    const classification = openaiRes.data.choices[0].message.content;

    return NextResponse.json({ reply: classification });
  } catch (error: any) {
    console.error("Error in API route:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to classify image" }, { status: 500 });
  }
}