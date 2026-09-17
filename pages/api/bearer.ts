import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch"; // Import node-fetch for making HTTP requests

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const { username, password } = req.body;

  // Replace the URL with your proxy server's URL
  const proxyServerUrl = "http://localhost:4000"; // Update with your proxy server URL
  const loginEndpoint = `${proxyServerUrl}/api/login`;

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await fetch(loginEndpoint, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate");
    }

    const responseData = await response.json();

    // Handle the response from your proxy server
    console.log(responseData);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
