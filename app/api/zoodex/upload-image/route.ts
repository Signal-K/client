import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(req: NextRequest) {
  if (!req.body) {
    return new Response('Request body is empty or null', { status: 400 });
  }

  try {
    const form = new FormData();
    const buffer = await req.arrayBuffer();
    const imageBlob = new Blob([buffer]); // Create a blob from the arrayBuffer
    form.append('file', imageBlob, 'image.jpg'); // Append the blob to the form data with a filename

    // Send the image to OpenAI for classification
    const response = await axios.post('https://api.openai.com/v1/images', form, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
    });

    return NextResponse.json({
      name: response.data.name,
      traits: response.data.traits,
    });

  } catch (error) {
    console.error('Error during file upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}