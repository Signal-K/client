import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob | null;

        if (!file) {
            console.error("No file found in this request.");
            return NextResponse.json({
                error: 'No file uploaded',
            },
            {
                status: 400
            });
        };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        console.log('File received. Size: ', buffer.length, ' bytes');

        const openaiRes = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4-turbo',
                messages: [

                ],
                max_tokens: 300,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            },
        );

        console.log("Raw OpenAI Response: ", openaiRes.data);
    } catch (error: any) {
        console.error("Error in API route:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to classify image" }, { status: 500 });
  };
};