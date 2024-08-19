import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

interface AuthRequestBody {
  auth: {
    username: string;
    password: string;
  };
}

interface TokenResponse {
  // Define the structure of the token response here
  // For example, if it's an object with specific fields, define them here
  // For this example, let's assume it's an object with a 'token' field
  token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse | { error: string }>
) {
  try {
    const response = await axios.post<TokenResponse>(
      "https://appeears.earthdatacloud.nasa.gov/api/login",
      {
        auth: {
          username: "mcdepth",
          password: "VgZ#MNYz5&Fv$@TPF!q*kJCeKw",
        },
      }
    );

    // Assuming the token is a string in the response
    const tokenResponse: TokenResponse = response.data;

    res.status(200).json(tokenResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}