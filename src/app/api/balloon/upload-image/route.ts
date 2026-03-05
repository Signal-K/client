import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 503 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "Return strict JSON with keys: species (string), confidence (number 0-1), traits (string[]), summary (string).",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Classify the organism in this image." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          },
        ],
        max_tokens: 250,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = String(openaiRes.data?.choices?.[0]?.message?.content || "").replace(/```json|```/g, "").trim();
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: "Model returned invalid classification payload" }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Error in balloon upload-image route:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to classify image" }, { status: 500 });
  }
}
